const express = require("express");

const GuestAuthRouter = express.Router();

const TokenService =
    require("../securityService/TokenService");

const PasswordHasher =
    require("../securityService/PasswordHasher");

const GuestService =
    require("../dbService/guestService");
const { requireGuestAuth } =
    require("../middleware/jwtAuth");


GuestAuthRouter
    .route("/register")
    .all(express.json())
    .post((req, res, next)=>{

        const {
            first_name,
            last_name,
            email,
            phone,
            password
        } = req.body;


        const requiredFields = {
            first_name,
            email,
            password
        };


        for(
            const [key, value]
            of Object.entries(requiredFields)
        ){

            if(!value){

                return res.status(400).json({
                    error: `Missing ${key}`
                });

            };

        };


        const database =
            req.app.get("db");


        GuestService
            .getGuestByEmail(
                database,
                email
            )
            .then(existingGuest => {
                    
                if(existingGuest){

                    return res.status(400).json({
                        error:
                            "An account with this email already exists"
                    });

                };


                return PasswordHasher
                    .hashPassword(password)
                    .then(password_hash => {

                        return GuestService
                            .createGuest(
                                database,
                                {
                                    first_name,
                                    last_name:
                                        last_name || null,
                                    email,
                                    phone:
                                        phone || null,
                                    password_hash
                                }
                            );

                    });

            })
            .then(guest => {

                if(!guest){

                    return;

                };


                delete guest.password_hash;


                const subject =
                    guest.email;


                const payload = {
                    user: guest.email,
                    type: "guest",
                    guest_id: guest.id
                };


                return res
                    .status(201)
                    .json({

                        token:
                            TokenService.createToken(
                                subject,
                                payload
                            ),

                        guest

                    });

            })
            .catch(next);

    });
    
GuestAuthRouter
    .route("/login")
    .all(express.json())
    .post((req, res, next)=>{

        const {
            email,
            password
        } = req.body;


        const guest = {
            email,
            password
        };


        for(
            const [key, value]
            of Object.entries(guest)
        ){

            if(!value){

                return res.status(400).json({
                    error: `Missing ${key}`
                });

            };

        };


        const database =
            req.app.get("db");


        GuestService
            .getGuestByEmail(
                database,
                email
            )
            .then(dbGuest => {

                if(!dbGuest){

                    return res.status(404).json({
                        error: `${email} not found`
                    });

                };


                return PasswordHasher
                    .comparePassword(
                        password,
                        dbGuest.password_hash
                    )
                    .then(passwordMatches => {

                        if(!passwordMatches){

                            return res.status(400).json({
                                error: "Incorrect password"
                            });

                        };


                        delete dbGuest.password_hash;


                        const subject =
                            dbGuest.email;


                        const payload = {
                            user: dbGuest.email,
                            type: "guest",
                            guest_id: dbGuest.id
                        };

                        delete dbGuest.password_hash;
                        
                        return res
                            .status(200)
                            .json({

                                token:
                                    TokenService.createToken(
                                        subject,
                                        payload
                                    ),

                                guest: dbGuest

                            });

                    });

            })
            .catch(next);

    });
    
module.exports = GuestAuthRouter;