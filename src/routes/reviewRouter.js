const express = require("express");
const ReviewRouter = express.Router();

const ReviewService = require("../dbService/reviewService");
const PropertyService = require("../dbService/propertyService");
const GuestService = require("../dbService/guestService");
const ReservationService = require("../dbService/reservationService");

const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL REVIEWS
    ADMIN ONLY
*/
ReviewRouter
    .route("/")
    .get(
        requireAuth,
        (req, res, next) => {

            ReviewService.getAllReviews(
                req.app.get("db")
            )
                .then(reviews => {

                    return res.status(200).json({
                        reviews
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET PUBLISHED REVIEWS BY PROPERTY
    PUBLIC
*/
ReviewRouter
    .route("/property/:property_id")
    .get(
        (req, res, next) => {

            const { property_id } = req.params;


            ReviewService.getReviewsByPropertyId(
                req.app.get("db"),
                property_id
            )
                .then(reviews => {

                    return res.status(200).json({
                        reviews
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET REVIEWS BY GUEST
    ADMIN ONLY
*/
ReviewRouter
    .route("/guest/:guest_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { guest_id } = req.params;


            ReviewService.getReviewsByGuestId(
                req.app.get("db"),
                guest_id
            )
                .then(reviews => {

                    return res.status(200).json({
                        reviews
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET REVIEW BY ID
    ADMIN ONLY
*/
ReviewRouter
    .route("/:id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            ReviewService.getReviewById(
                req.app.get("db"),
                id
            )
                .then(review => {

                    if(!review){

                        return res.status(404).json({
                            error: "Review not found"
                        });

                    };


                    return res.status(200).json({
                        review
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    CREATE REVIEW
    ADMIN ONLY FOR NOW

    Later, guest authentication can replace this
    with secure guest review creation.
*/
ReviewRouter
    .route("/")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                property_id,
                reservation_id,
                guest_id,
                rating,
                title,
                comment,
                is_published
            } = req.body;


            const newReview = {
                property_id,

                reservation_id:
                    reservation_id || null,

                guest_id:
                    guest_id || null,

                rating,

                title:
                    title || null,

                comment,

                is_published:
                    is_published === undefined
                        ? true
                        : is_published
            };


            const requiredFields = [
                "property_id",
                "rating",
                "comment"
            ];


            for(const field of requiredFields){

                if(
                    newReview[field] === undefined ||
                    newReview[field] === null ||
                    newReview[field] === ""
                ){

                    return res.status(400).json({
                        error: `Missing ${field} in body request`
                    });

                };

            };


            /*
                VALIDATE RATING
            */
            if(
                !Number.isInteger(rating) ||
                rating < 1 ||
                rating > 5
            ){

                return res.status(400).json({
                    error: "rating must be an integer between 1 and 5"
                });

            };


            /*
                VALIDATE PROPERTY
            */
            PropertyService.getPropertyById(
                req.app.get("db"),
                property_id
            )
                .then(property => {

                    if(!property){

                        return {
                            error: "Property not found",
                            status: 404
                        };

                    };


                    /*
                        IF RESERVATION EXISTS,
                        VALIDATE IT BEFORE CREATING REVIEW
                    */
                    if(reservation_id){

                        return ReservationService
                            .getReservationById(
                                req.app.get("db"),
                                reservation_id
                            )
                            .then(reservation => {

                                if(!reservation){

                                    return {
                                        error: "Reservation not found",
                                        status: 404
                                    };

                                };


                                if(
                                    reservation.property_id !==
                                    property_id
                                ){

                                    return {
                                        error:
                                            "Reservation does not belong to this property",
                                        status: 400
                                    };

                                };


                                if(
                                    guest_id &&
                                    reservation.guest_id !==
                                    guest_id
                                ){

                                    return {
                                        error:
                                            "Reservation does not belong to this guest",
                                        status: 400
                                    };

                                };


                                return {
                                    valid: true
                                };

                            });

                    };


                    /*
                        NO RESERVATION,
                        BUT GUEST WAS PROVIDED
                    */
                    if(guest_id){

                        return GuestService.getGuestById(
                            req.app.get("db"),
                            guest_id
                        )
                            .then(guest => {

                                if(!guest){

                                    return {
                                        error: "Guest not found",
                                        status: 404
                                    };

                                };


                                return {
                                    valid: true
                                };

                            });

                    };


                    return {
                        valid: true
                    };

                })
                .then(validation => {

                    if(validation.error){

                        return res
                            .status(validation.status)
                            .json({
                                error: validation.error
                            });

                    };


                    /*
                        IF BOTH RESERVATION AND GUEST
                        WERE PROVIDED, THE RESERVATION
                        VALIDATION ALREADY CONFIRMED
                        THE GUEST RELATIONSHIP.

                        IF ONLY GUEST WAS PROVIDED,
                        IT WAS VALIDATED ABOVE.
                    */
                    return ReviewService.createReview(
                        req.app.get("db"),
                        newReview
                    );

                })
                .then(review => {

                    if(!review){

                        return;

                    };


                    return res.status(201).json({
                        review
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    UPDATE REVIEW
    ADMIN ONLY
*/
ReviewRouter
    .route("/:id")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const updatedReview = {
                ...req.body
            };


            if(!Object.keys(updatedReview).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            /*
                PROTECT RELATIONSHIPS AND
                DATABASE-CONTROLLED FIELDS
            */
            delete updatedReview.id;
            delete updatedReview.property_id;
            delete updatedReview.reservation_id;
            delete updatedReview.guest_id;
            delete updatedReview.created_at;
            delete updatedReview.updated_at;


            if(
                updatedReview.rating !== undefined &&
                (
                    !Number.isInteger(updatedReview.rating) ||
                    updatedReview.rating < 1 ||
                    updatedReview.rating > 5
                )
            ){

                return res.status(400).json({
                    error: "rating must be an integer between 1 and 5"
                });

            };


            ReviewService.updateReviewById(
                req.app.get("db"),
                updatedReview,
                id
            )
                .then(review => {

                    if(!review){

                        return res.status(404).json({
                            error: "Review not found"
                        });

                    };


                    return res.status(200).json({
                        review
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    DELETE REVIEW
    ADMIN ONLY
*/
ReviewRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            ReviewService.deleteReviewById(
                req.app.get("db"),
                id
            )
                .then(review => {

                    if(!review){

                        return res.status(404).json({
                            error: "Review not found"
                        });

                    };


                    return res.status(200).json({
                        review
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = ReviewRouter;