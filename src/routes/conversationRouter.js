const express = require("express");
const ConversationRouter = express.Router();

const ConversationService = require("../dbService/conversationService");
const GuestService = require("../dbService/guestService");
const PropertyService = require("../dbService/propertyService");
const ReservationService = require("../dbService/reservationService");

const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL CONVERSATIONS
*/
ConversationRouter
    .route("/")
    .get(
        requireAuth,
        (req, res, next) => {

            ConversationService.getAllConversations(
                req.app.get("db")
            )
                .then(conversations => {

                    return res.status(200).json({
                        conversations
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET CONVERSATIONS BY GUEST
*/
ConversationRouter
    .route("/guest/:guest_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { guest_id } = req.params;


            ConversationService.getConversationsByGuestId(
                req.app.get("db"),
                guest_id
            )
                .then(conversations => {

                    return res.status(200).json({
                        conversations
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET CONVERSATIONS BY RESERVATION
*/
ConversationRouter
    .route("/reservation/:reservation_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { reservation_id } = req.params;


            ConversationService.getConversationsByReservationId(
                req.app.get("db"),
                reservation_id
            )
                .then(conversations => {

                    return res.status(200).json({
                        conversations
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET CONVERSATION BY ID
*/
ConversationRouter
    .route("/:id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            ConversationService.getConversationById(
                req.app.get("db"),
                id
            )
                .then(conversation => {

                    if(!conversation){

                        return res.status(404).json({
                            error: "Conversation not found"
                        });

                    };


                    return res.status(200).json({
                        conversation
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    CREATE CONVERSATION
*/
ConversationRouter
    .route("/")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                guest_id,
                property_id,
                reservation_id,
                subject
            } = req.body;


            if(
                guest_id === undefined ||
                guest_id === null ||
                guest_id === ""
            ){

                return res.status(400).json({
                    error: "Missing guest_id in body request"
                });

            };


            let newConversation;


            GuestService.getGuestById(
                req.app.get("db"),
                guest_id
            )
                .then(guest => {

                    if(!guest){

                        return res.status(404).json({
                            error: "Guest not found"
                        });

                    };


                    if(property_id){

                        return PropertyService.getPropertyById(
                            req.app.get("db"),
                            property_id
                        );

                    };


                    return null;

                })
                .then(property => {

                    if(
                        property_id &&
                        !property
                    ){

                        return res.status(404).json({
                            error: "Property not found"
                        });

                    };


                    if(reservation_id){

                        return ReservationService.getReservationById(
                            req.app.get("db"),
                            reservation_id
                        );

                    };


                    return null;

                })
                .then(reservation => {

                    if(
                        reservation_id &&
                        !reservation
                    ){

                        return res.status(404).json({
                            error: "Reservation not found"
                        });

                    };


                    newConversation = {
                        guest_id,
                        property_id:
                            property_id || null,
                        reservation_id:
                            reservation_id || null,
                        subject:
                            subject || null,
                        status:
                            "open"
                    };


                    return ConversationService.createConversation(
                        req.app.get("db"),
                        newConversation
                    );

                })
                .then(conversation => {

                    if(!conversation){

                        return;

                    };


                    return res.status(201).json({
                        conversation
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    UPDATE CONVERSATION
*/
ConversationRouter
    .route("/:id")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const updatedConversation = {
                ...req.body
            };


            if(!Object.keys(updatedConversation).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            delete updatedConversation.id;
            delete updatedConversation.guest_id;
            delete updatedConversation.created_at;
            delete updatedConversation.updated_at;


            ConversationService.updateConversationById(
                req.app.get("db"),
                updatedConversation,
                id
            )
                .then(conversation => {

                    if(!conversation){

                        return res.status(404).json({
                            error: "Conversation not found"
                        });

                    };


                    return res.status(200).json({
                        conversation
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = ConversationRouter;