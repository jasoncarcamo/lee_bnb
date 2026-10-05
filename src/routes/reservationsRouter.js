const express = require("express");
const ReservationRouter = express.Router();

const ReservationService = require("../dbService/reservationService");
const ReservationValidationService = require("../dbService/reservationValidationService");
const { requireAuth } = require("../middleware/jwtAuth");
const RefundService = require("../dbService/refundService");
const PaymentService = require("../dbService/paymentService");
const notificationService = require("../dbService/notificationService");


/*
    GET ALL RESERVATIONS
*/
ReservationRouter
    .route("/")
    .get(
        requireAuth,
        (req, res, next) => {

            ReservationService.getAllReservations(
                req.app.get("db")
            )
                .then(reservations => {

                    return res.status(200).json({
                        reservations
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET RESERVATION BY ID
*/
ReservationRouter
    .route("/:id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            ReservationService.getReservationById(
                req.app.get("db"),
                id
            )
                .then(reservation => {

                    if(!reservation){

                        return res.status(404).json({
                            error: "Reservation not found"
                        });

                    };


                    return res.status(200).json({
                        reservation
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET RESERVATION BY CONFIRMATION CODE
*/
ReservationRouter
    .route("/confirmation/:confirmation_code")
    .get(
        requireAuth,
        (req, res, next) => {

            const { confirmation_code } = req.params;


            ReservationService.getReservationByConfirmationCode(
                req.app.get("db"),
                confirmation_code
            )
                .then(reservation => {

                    if(!reservation){

                        return res.status(404).json({
                            error: "Reservation not found"
                        });

                    };


                    return res.status(200).json({
                        reservation
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET RESERVATIONS BY PROPERTY
*/
ReservationRouter
    .route("/property/:property_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { property_id } = req.params;


            ReservationService.getReservationsByPropertyId(
                req.app.get("db"),
                property_id
            )
                .then(reservations => {

                    return res.status(200).json({
                        reservations
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET RESERVATIONS BY GUEST
*/
ReservationRouter
    .route("/guest/:guest_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { guest_id } = req.params;


            ReservationService.getReservationsByGuestId(
                req.app.get("db"),
                guest_id
            )
                .then(reservations => {

                    return res.status(200).json({
                        reservations
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET RESERVATIONS BY STATUS
*/
ReservationRouter
    .route("/status/:status")
    .get(
        requireAuth,
        (req, res, next) => {

            const { status } = req.params;


            ReservationService.getReservationsByStatus(
                req.app.get("db"),
                status
            )
                .then(reservations => {

                    return res.status(200).json({
                        reservations
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    CHECK RESERVATION DATES
*/
ReservationRouter
    .route("/property/:property_id/dates")
    .get(
        (req, res, next) => {

            const { property_id } = req.params;

            const {
                check_in,
                check_out
            } = req.query;


            if(
                check_in === undefined ||
                check_in === null ||
                check_in === ""
            ){

                return res.status(400).json({
                    error: "Missing check_in"
                });

            };


            if(
                check_out === undefined ||
                check_out === null ||
                check_out === ""
            ){

                return res.status(400).json({
                    error: "Missing check_out"
                });

            };


            ReservationService.getReservationsBetweenDates(
                req.app.get("db"),
                property_id,
                check_in,
                check_out
            )
                .then(reservations => {

                    return res.status(200).json({
                        reservations
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );



/*
    CREATE RESERVATION
*/
ReservationRouter
    .route("/")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                inquiry_id,
                property_id,
                guest_id,
                check_in,
                check_out,
                guests_count,
                special_requests
            } = req.body;


            const reservationData = {
                inquiry_id: inquiry_id || null,
                property_id,
                guest_id,
                check_in,
                check_out,
                guests_count,
                special_requests
            };
            
            console.log(guest_id)


            ReservationValidationService
                .validateProperty(
                    req.app.get("db"),
                    property_id
                )
                .then(propertyResult => {

                    if(!propertyResult.valid){

                        return res.status(400).json({
                            error: propertyResult.error
                        });

                    };


                    const property =
                        propertyResult.property;

                    console.log(guest_id)
                    return ReservationValidationService
                        .validateGuest(
                            req.app.get("db"),
                            guest_id
                        )
                        .then(guestResult => {

                            if(!guestResult.valid){

                                return res.status(400).json({
                                    error: guestResult.error
                                });

                            };


                            const dateResult =
                                ReservationValidationService
                                    .validateDates(
                                        check_in,
                                        check_out
                                    );


                            if(!dateResult.valid){

                                return res.status(400).json({
                                    error: dateResult.error
                                });

                            };


                            const guestCountResult =
                                ReservationValidationService
                                    .validateGuestCount(
                                        guests_count,
                                        property
                                    );


                            if(!guestCountResult.valid){

                                return res.status(400).json({
                                    error: guestCountResult.error
                                });

                            };


                            return ReservationValidationService
                                .checkExistingReservations(
                                    req.app.get("db"),
                                    property_id,
                                    check_in,
                                    check_out
                                )
                                .then(reservationResult => {

                                    if(!reservationResult.valid){

                                        return res.status(400).json({
                                            error: reservationResult.error
                                        });

                                    };


                                    return ReservationValidationService
                                        .checkAvailability(
                                            req.app.get("db"),
                                            property_id,
                                            check_in,
                                            check_out
                                        )
                                        .then(availabilityResult => {

                                            if(!availabilityResult.valid){

                                                return res.status(400).json({
                                                    error: availabilityResult.error
                                                });

                                            };
                                            
                                            const pricingData = {
                                                ...reservationData,
                                                property
                                            };


                                            return ReservationValidationService
                                                .calculateReservationPricing(
                                                    req.app.get("db"),
                                                    pricingData
                                                )
                                                .then(pricingResult => {

                                                    const total =
                                                        ReservationValidationService
                                                            .calculateReservationTotal(
                                                                property,
                                                                pricingResult
                                                            );


                                                    const confirmationCode =
                                                        `RES-${Date.now()}`;


                                                    const newReservation = {
                                                        inquiry_id,
                                                        property_id,
                                                        guest_id,
                                                        confirmation_code:
                                                            confirmationCode,
                                                        check_in,
                                                        check_out,
                                                        guests_count,
                                                        nights: pricingResult.nights,
                                                        nightly_subtotal: total.nightly_subtotal,
                                                        cleaning_fee: total.cleaning_fee,
                                                        service_fee: total.service_fee,
                                                        taxes: total.taxes,
                                                        discount: total.discount,
                                                        total_price: total.total_price,
                                                        currency: property.currency,
                                                        status: "pending",
                                                        special_requests: special_requests || null
                                                    };


                                                    return ReservationService
                                                        .createReservation(
                                                            req.app.get("db"),
                                                            newReservation
                                                        )
                                                        .then(reservation => {

                                                            const newNotification = {
                                                                type: "new_reservation",
                                                                title: "New Reservation",
                                                                message:
                                                                    `A new reservation was created with confirmation code ${reservation.confirmation_code}.`,
                                                                property_id:
                                                                    reservation.property_id,
                                                                reservation_id:
                                                                    reservation.id,
                                                                conversation_id:
                                                                    null,
                                                                inquiry_id:
                                                                    reservation.inquiry_id,
                                                                is_read:
                                                                    false,
                                                            };

                                                            return notificationService
                                                                .createNotification(
                                                                    req.app.get("db"),
                                                                    newNotification
                                                                )
                                                                .then(() => {

                                                                    return res.status(201).json({
                                                                        reservation
                                                                    });

                                                                });

                                                        });

                                                });

                                        });

                                });

                        });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    UPDATE RESERVATION
*/
ReservationRouter
    .route("/:id")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const updatedReservation = {
                ...req.body
            };


            if(!Object.keys(updatedReservation).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            /*
                PROTECT DATABASE-CONTROLLED FIELDS
            */
            delete updatedReservation.id;
            delete updatedReservation.created_at;
            delete updatedReservation.updated_at;

            delete updatedReservation.cancelled_at;
            delete updatedReservation.cancellation_reason;


            ReservationService.updateReservationById(
                req.app.get("db"),
                updatedReservation,
                id
            )
                .then(reservation => {

                    if(!reservation){

                        return res.status(404).json({
                            error: "Reservation not found"
                        });

                    };


                    const newNotification = {
                        type: "reservation_updated",
                        title: "Reservation Updated",
                        message:
                            `Reservation ${reservation.confirmation_code} was updated.`,
                        property_id:
                            reservation.property_id,
                        reservation_id:
                            reservation.id,
                        conversation_id:
                            null,
                        inquiry_id:
                            null,
                        is_read:
                            false
                    };


                    return notificationService
                        .deleteNotificationByReservationIdAndType(
                            req.app.get("db"),
                            reservation.id,
                            "reservation_updated"
                        )
                        .then(() => {

                            return notificationService
                                .createNotification(
                                    req.app.get("db"),
                                    newNotification
                                );

                        })
                        .then(() => {

                            return res.status(200).json({
                                reservation
                            });

                        });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    CANCEL RESERVATION
*/
ReservationRouter
    .route("/:id/cancel")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const {
                cancellation_reason
            } = req.body;


            if(
                typeof cancellation_reason !== "string" ||
                !cancellation_reason.trim()
            ){

                return res.status(400).json({
                    error: "Cancellation reason is required"
                });

            };


            const db = req.app.get("db");


            ReservationService.cancelReservationById(
                db,
                cancellation_reason.trim(),
                id
            )
                .then(reservation => {

                    if(!reservation){

                        return ReservationService
                            .getReservationById(
                                db,
                                id
                            )
                            .then(existingReservation => {

                                if(!existingReservation){

                                    return res.status(404).json({
                                        error: "Reservation not found"
                                    });

                                };


                                return res.status(409).json({
                                    error:
                                        `Cannot cancel a reservation with status "${existingReservation.status}"`
                                });

                            });

                    };


                    const newNotification = {

                        type: "reservation_cancelled",

                        title: "Reservation Cancelled",

                        message:
                            `Reservation ${reservation.confirmation_code} was cancelled.`,

                        property_id:
                            reservation.property_id,

                        reservation_id:
                            reservation.id,

                        conversation_id:
                            null,

                        inquiry_id:
                            null,

                        is_read:
                            false

                    };


                    return notificationService
                        .deleteNotificationByReservationIdAndType(
                            db,
                            reservation.id,
                            "new_reservation"
                        )
                        .then(() => {

                            return notificationService
                                .createNotification(
                                    db,
                                    newNotification
                                );

                        })
                        .then(() => {

                            return res.status(200).json({
                                reservation
                            });

                        });

                })
                .catch(error => {

                    next(error);

                });

        }
    );

/*
    CANCEL RESERVATION
    + REFUND REMAINING PAYMENT BALANCE
*/
ReservationRouter
    .route("/:id/cancel-and-refund")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const {
                cancellation_reason
            } = req.body;


            /*
                VALIDATE CANCELLATION REASON
            */
            if(
                typeof cancellation_reason !== "string" ||
                !cancellation_reason.trim()
            ){

                return res.status(400).json({
                    error:
                        "Cancellation reason is required"
                });

            };


            const db =
                req.app.get("db");


            /*
                RESERVATION CANCELLATION
                + REMAINING REFUND

                ALL DATABASE CHANGES ARE MADE
                IN ONE TRANSACTION.
            */
            db.transaction(async trx => {

                /*
                    LOCK RESERVATION
                */
                const reservation =
                    await trx("reservations")
                        .where({
                            id
                        })
                        .forUpdate()
                        .first();


                if(!reservation){

                    return {
                        status: 404,

                        body: {
                            error:
                                "Reservation not found"
                        }
                    };

                };


                /*
                    ONLY PENDING / CONFIRMED
                    RESERVATIONS CAN BE CANCELLED
                */
                if(
                    ![
                        "pending",
                        "confirmed"
                    ].includes(
                        reservation.status
                    )
                ){

                    return {
                        status: 409,

                        body: {
                            error:
                                `Cannot cancel a reservation with status "${reservation.status}"`
                        }
                    };

                };


                /*
                    FIND THE PAYMENT ASSOCIATED
                    WITH THIS RESERVATION.

                    PREFER A PAYMENT THAT HAS
                    ACTUALLY BEEN PAID.
                */
                const payment =
                    await trx("payments")
                        .where({
                            reservation_id:
                                reservation.id
                        })
                        .whereIn(
                            "status",
                            [
                                "paid",
                                "partially_refunded",
                                "refunded"
                            ]
                        )
                        .orderBy(
                            "created_at",
                            "desc"
                        )
                        .forUpdate()
                        .first();


                let refund = null;

                let updatedPayment =
                    payment || null;


                /*
                    IF THERE IS A PAID PAYMENT,
                    CALCULATE ITS REMAINING
                    REFUNDABLE BALANCE.
                */
                if(payment){

                    const refunds =
                        await RefundService
                            .getRefundsByPaymentId(
                                trx,
                                payment.id
                            );


                    const refundedCents =
                        refunds.reduce(
                            (
                                total,
                                existingRefund
                            ) => {

                                return total +
                                    Math.round(
                                        Number(
                                            existingRefund
                                                .amount
                                        ) * 100
                                    );

                            },
                            0
                        );


                    const paymentAmountCents =
                        Math.round(
                            Number(
                                payment.amount
                            ) * 100
                        );


                    const remainingCents =
                        paymentAmountCents -
                        refundedCents;


                    /*
                        DATABASE DATA SHOULD NEVER
                        HAVE MORE REFUNDED THAN THE
                        ORIGINAL PAYMENT.
                    */
                    if(remainingCents < 0){

                        const error =
                            new Error(
                                "Refund total exceeds payment amount"
                            );

                        error.status = 409;

                        throw error;

                    };


                    /*
                        REFUND ONLY THE REMAINING
                        BALANCE.

                        EXAMPLE:

                        Payment:         $648
                        Already refund:  $100
                        Remaining:       $548
                    */
                    if(remainingCents > 0){

                        const newRefund = {

                            payment_id:
                                payment.id,

                            amount:
                                (
                                    remainingCents /
                                    100
                                ).toFixed(2),

                            reason:
                                cancellation_reason
                                    .trim(),

                            provider_refund_id:
                                null

                        };


                        refund =
                            await RefundService
                                .createRefund(
                                    trx,
                                    newRefund
                                );

                    };


                    /*
                        AFTER THIS OPERATION THE
                        PAYMENT HAS NO REMAINING
                        REFUNDABLE BALANCE.
                    */
                    updatedPayment =
                        await PaymentService
                            .updatePaymentById(
                                trx,
                                {
                                    status:
                                        "refunded",

                                    refunded_at:
                                        payment.refunded_at ||
                                        new Date()
                                },
                                payment.id
                            );

                };


                /*
                    CANCEL RESERVATION
                */
                const cancelledReservation =
                    await ReservationService
                        .cancelReservationById(
                            trx,
                            cancellation_reason
                                .trim(),
                            reservation.id
                        );


                if(!cancelledReservation){

                    const error =
                        new Error(
                            "Reservation could not be cancelled"
                        );

                    error.status = 409;

                    throw error;

                };


                return {

                    status: 200,

                    body: {

                        reservation:
                            cancelledReservation,

                        payment:
                            updatedPayment,

                        refund

                    }

                };

            })
                .then(async result => {

                    /*
                        DATABASE TRANSACTION HAS
                        SUCCEEDED.

                        NOW UPDATE THE ADMIN
                        NOTIFICATION.
                    */
                    if(
                        result.status === 200 &&
                        result.body.reservation
                    ){

                        const reservation =
                            result.body.reservation;


                        const newNotification = {

                            type:
                                "reservation_cancelled",

                            title:
                                "Reservation Cancelled",

                            message:
                                `Reservation ${reservation.confirmation_code} was cancelled.`,

                            property_id:
                                reservation.property_id,

                            reservation_id:
                                reservation.id,

                            conversation_id:
                                null,

                            inquiry_id:
                                null,

                            is_read:
                                false

                        };


                        await notificationService
                            .deleteNotificationByReservationIdAndType(
                                db,
                                reservation.id,
                                "new_reservation"
                            );


                        await notificationService
                            .createNotification(
                                db,
                                newNotification
                            );

                    };


                    return res
                        .status(result.status)
                        .json(result.body);

                })
                .catch(error => {

                    if(error.status){

                        return res
                            .status(error.status)
                            .json({
                                error:
                                    error.message
                            });

                    };


                    next(error);

                });

        }
    );

module.exports = ReservationRouter;