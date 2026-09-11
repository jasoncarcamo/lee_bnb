const express = require("express");
const ReservationRouter = express.Router();

const ReservationService = require("../dbService/reservationService");
const PropertyService = require("../dbService/propertyService");
const GuestService = require("../dbService/guestService");

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
                confirmation_code,
                check_in,
                check_out,
                guests_count,
                nights,
                nightly_subtotal,
                cleaning_fee,
                service_fee,
                taxes,
                discount,
                total_price,
                currency,
                status,
                special_requests
            } = req.body;


            const newReservation = {
                property_id,
                guest_id,
                confirmation_code,
                check_in,
                check_out,
                guests_count,
                nights,
                nightly_subtotal,
                cleaning_fee,
                service_fee,
                taxes,
                discount,
                total_price,
                currency,
                status,
                special_requests
            };


            const requiredFields = [
                "property_id",
                "guest_id",
                "confirmation_code",
                "check_in",
                "check_out",
                "guests_count",
                "nights",
                "nightly_subtotal",
                "total_price"
            ];


            for(const field of requiredFields){

                if(
                    newReservation[field] === undefined ||
                    newReservation[field] === null ||
                    newReservation[field] === ""
                ){

                    return res.status(400).json({
                        error: `Missing ${field} in body request`
                    });

                };

            };


            /*
                VERIFY PROPERTY
            */
            PropertyService.getPropertyById(
                req.app.get("db"),
                property_id
            )
                .then(property => {

                    if(!property){

                        return res.status(404).json({
                            error: "Property not found"
                        });

                    };


                    /*
                        VERIFY GUEST
                    */
                    return GuestService.getGuestById(
                        req.app.get("db"),
                        guest_id
                    );

                })
                .then(guest => {

                    if(!guest){

                        return res.status(404).json({
                            error: "Guest not found"
                        });

                    };


                    /*
                        CHECK FOR DATE CONFLICT
                    */
                    return ReservationService.getReservationsBetweenDates(
                        req.app.get("db"),
                        property_id,
                        check_in,
                        check_out
                    );

                })
                .then(existingReservations => {

                    if(existingReservations.length > 0){

                        return res.status(409).json({
                            error: "Property is already reserved for some or all of these dates"
                        });

                    };


                    /*
                        CREATE RESERVATION
                    */
                    return ReservationService.createReservation(
                        req.app.get("db"),
                        newReservation
                    );

                })
                .then(createdReservation => {

                    if(!createdReservation){

                        return;

                    };


                    return res.status(201).json({
                        reservation: createdReservation
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