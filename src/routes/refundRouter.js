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

                    if(!refund){

                        return res.status(404).json({
                            error: "Refund not found"
                        });

                    };


                    return res.status(200).json({
                        refund
                    });

                })
                .catch(error => {

                    next(error);

                });

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
                .catch(error => {

                    next(error);

                });

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


            if(
                payment_id === undefined ||
                payment_id === null ||
                payment_id === ""
            ){

                return res.status(400).json({
                    error: "Missing payment_id in body request"
                });

            };


            if(
                amount === undefined ||
                amount === null ||
                amount === ""
            ){

                return res.status(400).json({
                    error: "Missing amount in body request"
                });

            };


            const refundAmount = Number(amount);


            if(
                Number.isNaN(refundAmount) ||
                refundAmount <= 0
            ){

                return res.status(400).json({
                    error: "Refund amount must be greater than 0"
                });

            };


            let payment;


            PaymentService.getPaymentById(
                req.app.get("db"),
                payment_id
            )
                .then(foundPayment => {

                    if(!foundPayment){

                        return res.status(404).json({
                            error: "Payment not found"
                        });

                    };


                    payment = foundPayment;


                    return RefundService.getRefundsByPaymentId(
                        req.app.get("db"),
                        payment_id
                    );

                })
                .then(refunds => {

                    if(!refunds){

                        return;

                    };


                    const refundedAmount =
                        refunds.reduce(
                            (total, refund) => {

                                return total +
                                    Number(refund.amount);

                            },
                            0
                        );


                    const remainingAmount =
                        Number(payment.amount) -
                        refundedAmount;


                    if(refundAmount > remainingAmount){

                        return res.status(400).json({
                            error:
                                `Refund amount cannot exceed remaining payment amount of ${remainingAmount.toFixed(2)}`
                        });

                    };


                    const newRefund = {

                        payment_id,

                        amount:
                            refundAmount,

                        reason:
                            reason || null,

                        provider_refund_id:
                            provider_refund_id || null

                    };


                    return RefundService.createRefund(
                        req.app.get("db"),
                        newRefund
                    );

                })
                .then(refund => {

                    if(!refund){

                        return;

                    };


                    const totalRefunded =
                        Number(refund.amount);


                    /*
                        IF THIS REFUND COMPLETES
                        THE FULL PAYMENT REFUND
                    */
                    return RefundService.getRefundsByPaymentId(
                        req.app.get("db"),
                        payment_id
                    )
                        .then(refunds => {

                            const refundedAmount =
                                refunds.reduce(
                                    (total, item) => {

                                        return total +
                                            Number(item.amount);

                                    },
                                    0
                                );


                            if(
                                refundedAmount >=
                                Number(payment.amount)
                            ){

                                return PaymentService.updatePaymentById(
                                    req.app.get("db"),
                                    {
                                        status: "refunded",
                                        refunded_at: new Date()
                                    },
                                    payment_id
                                )
                                    .then(() => refund);

                            };


                            return refund;

                        });

                })
                .then(refund => {

                    if(!refund){

                        return;

                    };


                    return res.status(201).json({
                        refund
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = RefundRouter;