const express = require("express");
const crypto = require("crypto");

const GuestConversationAccessRouter = express.Router();

const GuestConversationAccessService =
    require("../dbService/guestConversationAccessService");

const ConversationService =
    require("../dbService/conversationService");

const { requireAuth } =
    require("../middleware/jwtAuth");


/*
    GENERATE ACCESS TOKEN
*/
function generateAccessToken() {

    return crypto
        .randomBytes(32)
        .toString("hex");

}


/*
    HASH ACCESS TOKEN
*/
function hashAccessToken(token) {

    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

}


/*
    GET ACCESS RECORDS BY CONVERSATION
*/
GuestConversationAccessRouter
    .route("/conversation/:conversation_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const {
                conversation_id
            } = req.params;


            GuestConversationAccessService
                .getAccessByConversationId(
                    req.app.get("db"),
                    conversation_id
                )
                .then(accessRecords => {

                    return res.status(200).json({
                        access: accessRecords
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    CREATE CONVERSATION ACCESS
*/
GuestConversationAccessRouter
    .route("/conversation/:conversation_id")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                conversation_id
            } = req.params;

            const {
                expires_at
            } = req.body;


            ConversationService
                .getConversationById(
                    req.app.get("db"),
                    conversation_id
                )
                .then(conversation => {

                    if(!conversation){

                        return res.status(404).json({
                            error: "Conversation not found"
                        });

                    };


                    const accessToken =
                        generateAccessToken();


                    const accessTokenHash =
                        hashAccessToken(
                            accessToken
                        );


                    const newAccess = {

                        guest_id:
                            conversation.guest_id,

                        conversation_id,

                        access_token_hash:
                            accessTokenHash,

                        expires_at:
                            expires_at || null

                    };


                    return GuestConversationAccessService
                        .createConversationAccess(
                            req.app.get("db"),
                            newAccess
                        )
                        .then(access => {

                            return res.status(201).json({

                                access: {
                                    id:
                                        access.id,

                                    guest_id:
                                        access.guest_id,

                                    conversation_id:
                                        access.conversation_id,

                                    expires_at:
                                        access.expires_at,

                                    created_at:
                                        access.created_at
                                },

                                access_token:
                                    accessToken

                            });

                        });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    VERIFY GUEST CONVERSATION ACCESS
*/
GuestConversationAccessRouter
    .route("/verify")
    .post(
        express.json(),
        (req, res, next) => {

            const {
                access_token
            } = req.body;


            if(
                access_token === undefined ||
                access_token === null ||
                access_token === ""
            ){

                return res.status(400).json({
                    error: "Missing access_token in body request"
                });

            };


            const accessTokenHash =
                hashAccessToken(
                    access_token
                );


            GuestConversationAccessService
                .getAccessByTokenHash(
                    req.app.get("db"),
                    accessTokenHash
                )
                .then(access => {

                    if(!access){

                        return res.status(401).json({
                            error: "Invalid conversation access token"
                        });

                    };


                    if(
                        access.expires_at &&
                        new Date(access.expires_at) <= new Date()
                    ){

                        return res.status(401).json({
                            error: "Conversation access token has expired"
                        });

                    };


                    return GuestConversationAccessService
                        .updateLastUsed(
                            req.app.get("db"),
                            access.id
                        )
                        .then(updatedAccess => {

                            return res.status(200).json({

                                access: {
                                    id:
                                        updatedAccess.id,

                                    guest_id:
                                        updatedAccess.guest_id,

                                    conversation_id:
                                        updatedAccess.conversation_id,

                                    expires_at:
                                        updatedAccess.expires_at,

                                    last_used_at:
                                        updatedAccess.last_used_at
                                }

                            });

                        });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    DELETE / REVOKE CONVERSATION ACCESS
*/
GuestConversationAccessRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const {
                id
            } = req.params;


            GuestConversationAccessService
                .deleteAccessById(
                    req.app.get("db"),
                    id
                )
                .then(access => {

                    if(!access){

                        return res.status(404).json({
                            error: "Conversation access not found"
                        });

                    };


                    return res.status(200).json({
                        access
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = GuestConversationAccessRouter;