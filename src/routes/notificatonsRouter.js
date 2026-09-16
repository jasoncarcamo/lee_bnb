const express = require("express");
const NotificationRouter = express.Router();

const NotificationService = require("../dbService/notificationService");
const PropertyService = require("../dbService/propertyService");
const ReservationService = require("../dbService/reservationService");
const ConversationService = require("../dbService/conversationService");
const InquiryService = require("../dbService/inquiryService");

const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL NOTIFICATIONS
*/
NotificationRouter
    .route("/")
    .get(
        requireAuth,
        (req, res, next) => {

            NotificationService.getAllNotifications(
                req.app.get("db")
            )
                .then(notifications => {

                    return res.status(200).json({
                        notifications
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET UNREAD NOTIFICATIONS
*/
NotificationRouter
    .route("/unread")
    .get(
        requireAuth,
        (req, res, next) => {

            NotificationService.getUnreadNotifications(
                req.app.get("db")
            )
                .then(notifications => {

                    return res.status(200).json({
                        notifications
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET NOTIFICATIONS BY RESERVATION
*/
NotificationRouter
    .route("/reservation/:reservation_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { reservation_id } = req.params;


            NotificationService.getNotificationsByReservationId(
                req.app.get("db"),
                reservation_id
            )
                .then(notifications => {

                    return res.status(200).json({
                        notifications
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET NOTIFICATIONS BY CONVERSATION
*/
NotificationRouter
    .route("/conversation/:conversation_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { conversation_id } = req.params;


            NotificationService.getNotificationsByConversationId(
                req.app.get("db"),
                conversation_id
            )
                .then(notifications => {

                    return res.status(200).json({
                        notifications
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET NOTIFICATION BY ID
*/
NotificationRouter
    .route("/:id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            NotificationService.getNotificationById(
                req.app.get("db"),
                id
            )
                .then(notification => {

                    if(!notification){

                        return res.status(404).json({
                            error: "Notification not found"
                        });

                    };


                    return res.status(200).json({
                        notification
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    CREATE NOTIFICATION
*/
NotificationRouter
    .route("/")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                type,
                title,
                message,
                property_id,
                reservation_id,
                conversation_id,
                inquiry_id
            } = req.body;


            const newNotification = {
                type,
                title,

                message:
                    message || null,

                property_id:
                    property_id || null,

                reservation_id:
                    reservation_id || null,

                conversation_id:
                    conversation_id || null,

                inquiry_id:
                    inquiry_id || null,

                is_read: false
            };


            const requiredFields = [
                "type",
                "title"
            ];


            for(const field of requiredFields){

                if(
                    newNotification[field] === undefined ||
                    newNotification[field] === null ||
                    newNotification[field] === ""
                ){

                    return res.status(400).json({
                        error: `Missing ${field} in body request`
                    });

                };

            };


            /*
                VALIDATE OPTIONAL PROPERTY
            */
            const validateProperty = () => {

                if(!property_id){

                    return Promise.resolve({
                        valid: true
                    });

                };


                return PropertyService.getPropertyById(
                    req.app.get("db"),
                    property_id
                )
                    .then(property => {

                        if(!property){

                            return {
                                valid: false,
                                status: 404,
                                error: "Property not found"
                            };

                        };


                        return {
                            valid: true
                        };

                    });

            };


            /*
                VALIDATE OPTIONAL RESERVATION
            */
            const validateReservation = () => {

                if(!reservation_id){

                    return Promise.resolve({
                        valid: true
                    });

                };


                return ReservationService.getReservationById(
                    req.app.get("db"),
                    reservation_id
                )
                    .then(reservation => {

                        if(!reservation){

                            return {
                                valid: false,
                                status: 404,
                                error: "Reservation not found"
                            };

                        };


                        if(
                            property_id &&
                            reservation.property_id !== property_id
                        ){

                            return {
                                valid: false,
                                status: 400,
                                error:
                                    "Reservation does not belong to this property"
                            };

                        };


                        return {
                            valid: true
                        };

                    });

            };


            /*
                VALIDATE OPTIONAL CONVERSATION
            */
            const validateConversation = () => {

                if(!conversation_id){

                    return Promise.resolve({
                        valid: true
                    });

                };


                return ConversationService.getConversationById(
                    req.app.get("db"),
                    conversation_id
                )
                    .then(conversation => {

                        if(!conversation){

                            return {
                                valid: false,
                                status: 404,
                                error: "Conversation not found"
                            };

                        };


                        if(
                            property_id &&
                            conversation.property_id &&
                            conversation.property_id !== property_id
                        ){

                            return {
                                valid: false,
                                status: 400,
                                error:
                                    "Conversation does not belong to this property"
                            };

                        };


                        if(
                            reservation_id &&
                            conversation.reservation_id &&
                            conversation.reservation_id !== reservation_id
                        ){

                            return {
                                valid: false,
                                status: 400,
                                error:
                                    "Conversation does not belong to this reservation"
                            };

                        };


                        return {
                            valid: true
                        };

                    });

            };


            /*
                VALIDATE OPTIONAL INQUIRY
            */
            const validateInquiry = () => {

                if(!inquiry_id){

                    return Promise.resolve({
                        valid: true
                    });

                };


                return InquiryService.getInquiryById(
                    req.app.get("db"),
                    inquiry_id
                )
                    .then(inquiry => {

                        if(!inquiry){

                            return {
                                valid: false,
                                status: 404,
                                error: "Inquiry not found"
                            };

                        };


                        if(
                            property_id &&
                            inquiry.property_id &&
                            inquiry.property_id !== property_id
                        ){

                            return {
                                valid: false,
                                status: 400,
                                error:
                                    "Inquiry does not belong to this property"
                            };

                        };


                        return {
                            valid: true
                        };

                    });

            };


            validateProperty()
                .then(validation => {

                    if(!validation.valid){

                        return validation;

                    };


                    return validateReservation();

                })
                .then(validation => {

                    if(!validation.valid){

                        return validation;

                    };


                    return validateConversation();

                })
                .then(validation => {

                    if(!validation.valid){

                        return validation;

                    };


                    return validateInquiry();

                })
                .then(validation => {

                    if(!validation.valid){

                        return res
                            .status(validation.status)
                            .json({
                                error: validation.error
                            });

                    };


                    return NotificationService.createNotification(
                        req.app.get("db"),
                        newNotification
                    );

                })
                .then(notification => {

                    if(!notification){

                        return;

                    };


                    return res.status(201).json({
                        notification
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    MARK ONE NOTIFICATION AS READ
*/
NotificationRouter
    .route("/:id/read")
    .patch(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            NotificationService.markNotificationAsRead(
                req.app.get("db"),
                id
            )
                .then(notification => {

                    if(!notification){

                        return res.status(404).json({
                            error: "Notification not found"
                        });

                    };


                    return res.status(200).json({
                        notification
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    DELETE NOTIFICATION
*/
NotificationRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            NotificationService.deleteNotificationById(
                req.app.get("db"),
                id
            )
                .then(notification => {

                    if(!notification){

                        return res.status(404).json({
                            error: "Notification not found"
                        });

                    };


                    return res.status(200).json({
                        notification
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = NotificationRouter;