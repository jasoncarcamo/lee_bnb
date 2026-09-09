const express = require("express");
const RegisterRouter = express.Router();

const AdminAccountService = require("../dbService/adminAccountService");
const PasswordHasher = require("../securityService/PasswordHasher");


RegisterRouter
    .route("/register")
    .all(express.json())
    .post((req, res)=>{

        const {
            first_name,
            last_name,
            email,
            password
        } = req.body;


        const newAdmin = {
            first_name,
            last_name,
            email,
            password
        };

        const database = req.app.get("db");

        console.log(first_name);
        for(const [key, value] of Object.entries(newAdmin)){

            if(value == undefined){

                return res.status(400).json({
                    error: `Missing ${key} in body request`
                });

            };

        };


        AdminAccountService.getAdminByEmail(
            database,
            newAdmin.email
        )
            .then(dbAdmin => {

                if(dbAdmin){

                    return res.status(400).json({
                        error: "You seem to have an account already. Log in"
                    });

                };


                PasswordHasher.hashPassword(newAdmin.password)
                    .then(hashedPassword => {

                        const adminToCreate = {

                            first_name: newAdmin.first_name,
                            last_name: newAdmin.last_name,
                            email: newAdmin.email,
                            password_hash: hashedPassword

                        };


                        AdminAccountService.createAdmin(
                            database,
                            adminToCreate
                        )
                            .then(admin => {

                                return res.status(201).json({

                                    message: "Admin account created successfully",

                                    admin: {
                                        id: admin.id,
                                        first_name: admin.first_name,
                                        last_name: admin.last_name,
                                        email: admin.email
                                    }

                                });

                            });

                    });

            });

    });


module.exports = RegisterRouter;