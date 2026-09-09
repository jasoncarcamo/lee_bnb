const express = require("express");
const LogInRouter = express.Router();

const TokenService = require("../securityServices/tokenService");
const PasswordHasher = require("../securityServices/passwordHasher");
const AdminAccountService = require("../dbService/adminAccountService");


LogInRouter
    .route("/login")
    .all(express.json())
    .post((req, res)=>{

        const {
            email,
            password
        } = req.body;

        const admin = {
            email,
            password
        };

        const database = req.app.get("db");


        for(const [key, value] of Object.entries(admin)){

            if(!value){

                return res.status(400).json({
                    error: `Missing ${key}`
                });

            };

        };


        AdminAccountService.getAdminByEmail(database, admin.email)
            .then(dbAdmin => {

                if(!dbAdmin){

                    return res.status(404).json({
                        error: `${admin.email} not found`
                    });

                };


                PasswordHasher.comparePassword(
                    admin.password,
                    dbAdmin.password_hash
                )
                    .then(passwordMatches => {

                        if(!passwordMatches){

                            return res.status(400).json({
                                error: "Incorrect password"
                            });

                        };


                        delete dbAdmin.password_hash;


                        const subject = dbAdmin.email;

                        const payload = {
                            user: dbAdmin.email,
                            type: "admin"
                        };


                        return res.status(200).json({

                            token: TokenService.createToken(
                                subject,
                                payload
                            ),

                            admin: dbAdmin

                        });

                    });

            });

    });


module.exports = LogInRouter;
