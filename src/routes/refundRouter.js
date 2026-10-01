
const express = require("express");

const RefundRouter = express.Router();

const RefundService = require("../dbService/refundService");
const PaymentService = require("../dbService/paymentService");

const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET REFUND BY ID
*/
RefundRouter
    .route("/:id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            RefundService.getRefundById(
                req.app.get("db"),
                id
            )
                .then(refund => {

                    if (!refund) {

                        return res.status(404).json({
                            error: "Refund not found"
                        });

                    };


                    return res.status(200).json({
                        refund
                    });

                })
                .catch(next);

        }
    );


/*
    GET REFUNDS BY PAYMENT ID
*/
RefundRouter
    .route("/payment/:payment_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { payment_id } = req.params;


            RefundService.getRefundsByPaymentId(
                req.app.get("db"),
                payment_id
            )
                .then(refunds => {

                    return res.status(200).json({
                        refunds
                    });

                })
                .catch(next);

        }
    );


/*
    CREATE REFUND
*/
RefundRouter
    .route("/")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                payment_id,
                amount,
                reason,
                provider_refund_id
            } = req.body;


            /*
                VALIDATE PAYMENT ID
            */
            if (
                typeof payment_id !== "string" ||
                !payment_id.trim()
            ) {

                return res.status(400).json({
                    error: "Missing payment_id in body request"
                });

            };


            /*
                VALIDATE REFUND AMOUNT
            */
            if (
                amount === undefined ||
                amount === null ||
                amount === ""
            ) {

                return res.status(400).json({
                    error: "Missing amount in body request"
                });

            };


            const refundAmount = Number(amount);

            const refundAmountCents =
                Math.round(refundAmount * 100);


            if (
                !Number.isFinite(refundAmount) ||
                refundAmount <= 0 ||
                !Number.isSafeInteger(refundAmountCents) ||
                Math.abs(
                    refundAmount * 100 - refundAmountCents
                ) > 0.000001
            ) {

                return res.status(400).json({
                    error:
                        "Refund amount must be a positive amount with no more than two decimal places"
                });

            };


            const db = req.app.get("db");


            /*
                PAYMENT LOCK + REFUND CREATION
                + PAYMENT STATUS UPDATE

                ALL THREE OPERATIONS ARE PERFORMED
                IN ONE DATABASE TRANSACTION.
            */
            db.transaction(async trx => {

                /*
                    LOCK THE PAYMENT ROW.

                    A SECOND REFUND REQUEST FOR THIS
                    PAYMENT MUST WAIT UNTIL THIS
                    TRANSACTION FINISHES.
                */
                const payment = await trx("payments")
                    .where({
                        id: payment_id
                    })
                    .forUpdate()
                    .first();


                /*
                    PAYMENT MUST EXIST
                */
                if (!payment) {

                    return {
                        status: 404,

                        body: {
                            error: "Payment not found"
                        }
                    };

                };


                /*
                    PAYMENT MUST HAVE BEEN PAID.

                    A PARTIALLY REFUNDED PAYMENT
                    CAN RECEIVE ANOTHER REFUND.

                    A FULLY REFUNDED PAYMENT
                    WILL BE REJECTED BY THE
                    REMAINING-BALANCE CHECK BELOW.
                */
                if (
                    ![
                        "paid",
                        "partially_refunded",
                        "refunded"
                    ].includes(payment.status)
                ) {

                    return {
                        status: 409,

                        body: {
                            error:
                                `Cannot refund a payment with status "${payment.status}"`
                        }
                    };

                };


                /*
                    LOAD EXISTING REFUNDS WHILE
                    THE PAYMENT ROW IS LOCKED.
                */
                const refunds =
                    await RefundService.getRefundsByPaymentId(
                        trx,
                        payment_id
                    );


                /*
                    CALCULATE ALL AMOUNTS IN CENTS
                    TO AVOID FLOATING-POINT ERRORS.
                */
                const refundedCents =
                    refunds.reduce(
                        (total, refund) => {

                            return total +
                                Math.round(
                                    Number(refund.amount) * 100
                                );

                        },
                        0
                    );


                const paymentAmountCents =
                    Math.round(
                        Number(payment.amount) * 100
                    );


                const remainingCents =
                    paymentAmountCents -
                    refundedCents;


                /*
                    REJECT REFUNDS THAT EXCEED
                    THE REMAINING BALANCE.
                */
                if (
                    remainingCents <= 0 ||
                    refundAmountCents > remainingCents
                ) {

                    return {
                        status: 409,

                        body: {
                            error:
                                `Refund amount cannot exceed remaining payment amount of ${(Math.max(0, remainingCents) / 100).toFixed(2)}`
                        }
                    };

                };


                /*
                    CREATE REFUND RECORD
                */
                const newRefund = {

                    payment_id,

                    amount:
                        (refundAmountCents / 100).toFixed(2),

                    reason:
                        typeof reason === "string"
                            ? reason.trim() || null
                            : null,

                    provider_refund_id:
                        typeof provider_refund_id === "string"
                            ? provider_refund_id.trim() || null
                            : null

                };


                const refund =
                    await RefundService.createRefund(
                        trx,
                        newRefund
                    );


                /*
                    CALCULATE THE NEW REFUNDED TOTAL
                */
                const newRefundedCents =
                    refundedCents +
                    refundAmountCents;


                /*
                    UPDATE PAYMENT STATUS
                */
                if (
                    newRefundedCents ===
                    paymentAmountCents
                ) {

                    /*
                        FULLY REFUNDED
                    */
                    await PaymentService.updatePaymentById(
                        trx,
                        {
                            status: "refunded",

                            refunded_at: new Date()
                        },
                        payment_id
                    );

                } else {

                    /*
                        PARTIALLY REFUNDED
                    */
                    await PaymentService.updatePaymentById(
                        trx,
                        {
                            status: "partially_refunded",

                            refunded_at: null
                        },
                        payment_id
                    );

                };


                /*
                    SUCCESS RESPONSE
                */
                return {
                    status: 201,

                    body: {
                        refund
                    }
                };

            })
                .then(result => {

                    return res
                        .status(result.status)
                        .json(result.body);

                })
                .catch(next);

        }
    );


module.exports = RefundRouter;