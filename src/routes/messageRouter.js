const express = require("express");
const MessageRouter = express.Router();

const MessageService = require("../dbService/messageService");
const ConversationService = require("../dbService/conversationService");
const GuestService = require("../dbService/guestService");
const notificationService = require("../dbService/notificationService");

const { requireAuth } = require("../middleware/jwtAuth");

/*
    GET MESSAGES BY CONVERSATION
*/
MessageRouter
    .route("/conversation/:conversation_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { conversation_id } = req.params;


            MessageService.getMessagesByConversationId(
                req.app.get("db"),
                conversation_id
            )
                .then(messages => {

                    return res.status(200).json({
                        messages
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET MESSAGE BY ID
*/
MessageRouter
    .route("/:id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            MessageService.getMessageById(
                req.app.get("db"),
                id
            )
                .then(message => {

                    if(!message){

                        return res.status(404).json({
                            error: "Message not found"
                        });

                    };


                    return res.status(200).json({
                        message
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    CREATE MESSAGE
*/
MessageRouter
    .route("/")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                conversation_id,
                sender_type,
                guest_id,
                message
            } = req.body;


            const requiredFields = [
                "conversation_id",
                "sender_type",
                "message"
            ];


            const newMessage = {
                conversation_id,
                sender_type,
                guest_id:
                    guest_id || null,
                message
            };


            for(const field of requiredFields){

                if(
                    newMessage[field] === undefined ||
                    newMessage[field] === null ||
                    newMessage[field] === ""
                ){

                    return res.status(400).json({
                        error: `Missing ${field} in body request`
                    });

                };

            };


            if(
                sender_type !== "guest" &&
                sender_type !== "admin"
            ){

                return res.status(400).json({
                    error: "sender_type must be guest or admin"
                });

            };


            if(
                sender_type === "guest" &&
                !guest_id
            ){

                return res.status(400).json({
                    error: "Guest messages require guest_id"
                });

            };


            ConversationService.getConversationById(
                req.app.get("db"),
                conversation_id
            )
                .then(conversation => {

                    if(!conversation){

                        return res.status(404).json({
                            error: "Conversation not found"
                        });

                    };


                    if(
                        sender_type === "guest" &&
                        guest_id !== conversation.guest_id
                    ){

                        return res.status(400).json({
                            error: "Guest does not belong to this conversation"
                        });

                    };


                    if(
                        sender_type === "guest"
                    ){

                        return GuestService.getGuestById(
                            req.app.get("db"),
                            guest_id
                        );

                    };


                    return null;

                })
                .then(guest => {

                    if(
                        sender_type === "guest" &&
                        !guest
                    ){

                        return res.status(404).json({
                            error: "Guest not found"
                        });

                    };


                    return MessageService.createMessage(
                        req.app.get("db"),
                        newMessage
                    );

                })
                .then(createdMessage => {

                    if(!createdMessage){

                        return;

                    };


                    return ConversationService.updateConversationById(
                        req.app.get("db"),
                        {
                            last_message_at: new Date()
                        },
                        conversation_id
                    )
                        .then(() => {

                            const newNotification = {
                                type: "new_message",
                                title: "New Message",
                                message:
                                    sender_type === "guest"
                                        ? "A guest sent a new message."
                                        : "A new message was sent.",
                                property_id:
                                    null,
                                reservation_id:
                                    null,
                                conversation_id:
                                    createdMessage.conversation_id,
                                inquiry_id:
                                    null,
                                is_read:
                                    false
                            };


                            return notificationService
                                .createNotification(
                                    req.app.get("db"),
                                    newNotification
                                );

                        })
                        .then(() => {

                            return res.status(201).json({
                                message: createdMessage
                            });

                        });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    MARK MESSAGE AS READ
*/
MessageRouter
    .route("/:id/read")
    .patch(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            MessageService.markMessageAsRead(
                req.app.get("db"),
                id
            )
                .then(message => {

                    if(!message){

                        return res.status(404).json({
                            error: "Message not found"
                        });

                    };


                    return res.status(200).json({
                        message
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    MARK ALL CONVERSATION MESSAGES AS READ
*/
MessageRouter
    .route("/conversation/:conversation_id/read")
    .patch(
        requireAuth,
        (req, res, next) => {

            const { conversation_id } = req.params;


            MessageService.markConversationMessagesAsRead(
                req.app.get("db"),
                conversation_id
            )
                .then(messages => {

                    return res.status(200).json({
                        messages
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    DELETE MESSAGE
*/
MessageRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            MessageService.deleteMessageById(
                req.app.get("db"),
                id
            )
                .then(message => {

                    if(!message){

                        return res.status(404).json({
                            error: "Message not found"
                        });

                    };


                    return res.status(200).json({
                        message
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = MessageRouter;