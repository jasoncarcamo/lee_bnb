const express = require("express");
const GuestRouter = express.Router();

const GuestService = require("../dbService/guestService");
const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL GUESTS
*/
GuestRouter
    .route("/")
    .get(
        requireAuth,
        (req, res, next) => {

            GuestService.getAllGuests(
                req.app.get("db")
            )
                .then(guests => {

                    return res.status(200).json({
                        guests
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET GUEST BY ID
*/
GuestRouter
    .route("/:id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            GuestService.getGuestById(
                req.app.get("db"),
                id
            )
                .then(guest => {

                    if(!guest){

                        return res.status(404).json({
                            error: "Guest not found"
                        });

                    };


                    return res.status(200).json({
                        guest
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET GUEST BY EMAIL
*/
GuestRouter
    .route("/email/:email")
    .get(
        requireAuth,
        (req, res, next) => {

            const { email } = req.params;


            GuestService.getGuestByEmail(
                req.app.get("db"),
                email
            )
                .then(guest => {

                    if(!guest){

                        return res.status(404).json({
                            error: "Guest not found"
                        });

                    };


                    return res.status(200).json({
                        guest
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    CREATE GUEST
*/
GuestRouter
    .route("/")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                first_name,
                last_name,
                email,
                phone
            } = req.body;


            const newGuest = {
                first_name,
                last_name,
                email,
                phone
            };


            const requiredFields = [
                "first_name",
                "email"
            ];


            for(const field of requiredFields){

                if(
                    newGuest[field] === undefined ||
                    newGuest[field] === null ||
                    newGuest[field] === ""
                ){

                    return res.status(400).json({
                        error: `Missing ${field} in body request`
                    });

                };

            };


            /*
                CHECK IF GUEST ALREADY EXISTS
            */
            GuestService.getGuestByEmail(
                req.app.get("db"),
                newGuest.email
            )
                .then(existingGuest => {

                    if(existingGuest){

                        return res.status(400).json({
                            error: "A guest with this email already exists"
                        });

                    };


                    /*
                        CREATE GUEST
                    */
                    return GuestService.createGuest(
                        req.app.get("db"),
                        newGuest
                    );

                })
                .then(createdGuest => {

                    if(!createdGuest){

                        return;

                    };


                    return res.status(201).json({
                        guest: createdGuest
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    UPDATE GUEST
*/
GuestRouter
    .route("/:id")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const updatedGuest = req.body;


            if(!Object.keys(updatedGuest).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            /*
                PROTECT DATABASE-CONTROLLED FIELDS
            */
            delete updatedGuest.id;
            delete updatedGuest.created_at;
            delete updatedGuest.updated_at;


            GuestService.updateGuestById(
                req.app.get("db"),
                updatedGuest,
                id
            )
                .then(guest => {

                    if(!guest){

                        return res.status(404).json({
                            error: "Guest not found"
                        });

                    };


                    return res.status(200).json({
                        guest
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    DELETE GUEST
*/
GuestRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            GuestService.deleteGuestById(
                req.app.get("db"),
                id
            )
                .then(guest => {

                    if(!guest){

                        return res.status(404).json({
                            error: "Guest not found"
                        });

                    };


                    return res.status(200).json({
                        guest
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = GuestRouter;