const express = require("express");
const ReservationRouter = express.Router();

const ReservationService = require("../dbService/reservationService");
const PropertyService = require("../dbService/propertyService");
const GuestService = require("../dbService/guestService");
const ReservationValidationService = require("../dbService/reservationValidationService");
const { requireAuth } = require("../middleware/jwtAuth");


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
        requireAuth,
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
                property_id,
                guest_id,
                check_in,
                check_out,
                guests_count,
                special_requests
            } = req.body;


            const reservationData = {
                property_id,
                guest_id,
                check_in,
                check_out,
                guests_count,
                special_requests
            };


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

                                                        property_id,

                                                        guest_id,

                                                        confirmation_code:
                                                            confirmationCode,

                                                        check_in,

                                                        check_out,

                                                        guests_count,

                                                        nights:
                                                            pricingResult.nights,

                                                        nightly_subtotal:
                                                            total.nightly_subtotal,

                                                        cleaning_fee:
                                                            total.cleaning_fee,

                                                        service_fee:
                                                            total.service_fee,

                                                        taxes:
                                                            total.taxes,

                                                        discount:
                                                            total.discount,

                                                        total_price:
                                                            total.total_price,

                                                        currency:
                                                            property.currency,

                                                        status:
                                                            "pending",

                                                        special_requests:
                                                            special_requests || null

                                                    };


                                                    return ReservationService
                                                        .createReservation(
                                                            req.app.get("db"),
                                                            newReservation
                                                        )
                                                        .then(reservation => {

                                                            return res.status(201).json({
                                                                reservation
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
    CANCEL RESERVATION
*/
ReservationRouter
    .route("/:id/cancel")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const {
                cancellation_reason
            } = req.body;


            if(
                cancellation_reason === undefined ||
                cancellation_reason === null ||
                cancellation_reason === ""
            ){

                return res.status(400).json({
                    error: "Missing cancellation_reason in body request"
                });

            };


            ReservationService.cancelReservationById(
                req.app.get("db"),
                cancellation_reason,
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


module.exports = ReservationRouter;