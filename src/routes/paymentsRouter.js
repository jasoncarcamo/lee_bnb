const express = require("express");
const PaymentRouter = express.Router();

const PaymentService = require("../dbService/paymentService");
const ReservationService = require("../dbService/reservationService");

const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL PAYMENTS
*/
PaymentRouter
    .route("/")
    .get(
        requireAuth,
        (req, res, next) => {

            PaymentService.getAllPayments(
                req.app.get("db")
            )
                .then(payments => {

                    return res.status(200).json({
                        payments
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET PAYMENTS BY RESERVATION ID
*/
PaymentRouter
    .route("/reservation/:reservation_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { reservation_id } = req.params;


            PaymentService.getPaymentsByReservationId(
                req.app.get("db"),
                reservation_id
            )
                .then(payments => {

                    return res.status(200).json({
                        payments
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET PAYMENT BY PROVIDER PAYMENT ID
*/
PaymentRouter
    .route("/provider/:provider_payment_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { provider_payment_id } = req.params;


            PaymentService.getPaymentByProviderPaymentId(
                req.app.get("db"),
                provider_payment_id
            )
                .then(payment => {

                    if(!payment){

                        return res.status(404).json({
                            error: "Payment not found"
                        });

                    };


                    return res.status(200).json({
                        payment
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET PAYMENT BY ID
*/
PaymentRouter
    .route("/:id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            PaymentService.getPaymentById(
                req.app.get("db"),
                id
            )
                .then(payment => {

                    if(!payment){

                        return res.status(404).json({
                            error: "Payment not found"
                        });

                    };


                    return res.status(200).json({
                        payment
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    CREATE PAYMENT
*/
PaymentRouter
    .route("/")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                reservation_id,
                payment_provider,
                provider_payment_id,
                provider_customer_id,
                provider_checkout_session_id
            } = req.body;


            if(
                reservation_id === undefined ||
                reservation_id === null ||
                reservation_id === ""
            ){

                return res.status(400).json({
                    error: "Missing reservation_id in body request"
                });

            };


            ReservationService.getReservationById(
                req.app.get("db"),
                reservation_id
            )
                .then(reservation => {

                    if(!reservation){

                        return res.status(404).json({
                            error: "Reservation not found"
                        });

                    };


                    const newPayment = {

                        reservation_id,

                        amount:
                            reservation.total_price,

                        currency:
                            reservation.currency,

                        status:
                            "pending",

                        payment_provider:
                            payment_provider || "stripe",

                        provider_payment_id:
                            provider_payment_id || null,

                        provider_customer_id:
                            provider_customer_id || null,

                        provider_checkout_session_id:
                            provider_checkout_session_id || null

                    };


                    return PaymentService.createPayment(
                        req.app.get("db"),
                        newPayment
                    );

                })
                .then(payment => {

                    if(!payment){

                        return;

                    };


                    return res.status(201).json({
                        payment
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    UPDATE PAYMENT
*/
PaymentRouter
    .route("/:id")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const updatedPayment = {
                ...req.body
            };


            if(!Object.keys(updatedPayment).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            /*
                PROTECT DATABASE-CONTROLLED FIELDS
            */
            delete updatedPayment.id;
            delete updatedPayment.reservation_id;
            delete updatedPayment.amount;
            delete updatedPayment.currency;
            delete updatedPayment.created_at;
            delete updatedPayment.updated_at;


            PaymentService.updatePaymentById(
                req.app.get("db"),
                updatedPayment,
                id
            )
                .then(payment => {

                    if(!payment){

                        return res.status(404).json({
                            error: "Payment not found"
                        });

                    };


                    return res.status(200).json({
                        payment
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = PaymentRouter;