const express = require("express");

const PasswordResetRouter = express.Router();

const AdminAccountService = require("../dbService/adminAccountService");
const PasswordResetTokenService = require("../dbService/passwordResetTokenService");

const PasswordHasher = require("../securityService/PasswordHasher");
const PasswordResetTokenSecurityService = require("../securityService/PasswordResetTokenSecurityService");


PasswordResetRouter
    .route("/forgot-password")
    .all(express.json())
    .post((req, res, next) => {

        const {
            email
        } = req.body;

        if(!email){

            return res.status(400).json({
                error: "Missing email"
            });

        };

        const database = req.app.get("db");

        AdminAccountService.getAdminByEmail(
            database,
            email
        )
            .then(admin => {

                /*
                    DO NOT REVEAL WHETHER THE ACCOUNT EXISTS
                */
                if(!admin){

                    return res.status(200).json({
                        message:
                            "If an account exists for this email, a password reset link will be sent."
                    });

                };

                /*
                    REMOVE EXPIRED TOKENS
                */
                return PasswordResetTokenService
                    .deleteExpiredTokens(database)
                    .then(() => {

                        /*
                            CREATE SECURE RAW TOKEN
                        */
                        const resetToken =
                            PasswordResetTokenSecurityService
                                .createToken();

                        /*
                            STORE ONLY THE HASH
                        */
                        const tokenHash =
                            PasswordResetTokenSecurityService
                                .hashToken(resetToken);

                        const expiresAt = new Date(
                            Date.now() + (60 * 60 * 1000)
                        );

                        const newPasswordResetToken = {
                            admin_id:
                                admin.id,
                            token_hash:
                                tokenHash,
                            expires_at:
                                expiresAt
                        };

                        return PasswordResetTokenService
                            .createPasswordResetToken(
                                database,
                                newPasswordResetToken
                            )
                            .then(() => {

                                /*
                                    TEMPORARY LOCAL TESTING ONLY

                                    Nodemailer will eventually send
                                    resetToken by email.

                                    NEVER return this token from the
                                    production API.
                                */
                                return res.status(200).json({
                                    message:
                                        "If an account exists for this email, a password reset link will be sent.",
                                    reset_token:
                                        resetToken
                                });

                            });

                    });

            })
            .catch(error => {

                next(error);

            });

    });

PasswordResetRouter
    .route("/reset-password")
    .all(express.json())
    .post((req, res, next) => {

        const {
            token,
            password
        } = req.body;

        if(!token){

            return res.status(400).json({
                error: "Missing token"
            });

        };

        if(!password){

            return res.status(400).json({
                error: "Missing password"
            });

        };

        if(password.length < 8){

            return res.status(400).json({
                error: "Password must be at least 8 characters"
            });

        };

        const database = req.app.get("db");

        const tokenHash =
            PasswordResetTokenSecurityService
                .hashToken(token);

        PasswordResetTokenService
            .getTokenByHash(
                database,
                tokenHash
            )
            .then(passwordResetToken => {

                if(!passwordResetToken){

                    return res.status(400).json({
                        error: "Invalid or expired password reset token"
                    });

                };

                if(passwordResetToken.used_at){

                    return res.status(400).json({
                        error: "Invalid or expired password reset token"
                    });

                };

                if(
                    new Date(passwordResetToken.expires_at)
                    <= new Date()
                ){

                    return res.status(400).json({
                        error: "Invalid or expired password reset token"
                    });

                };

                return PasswordHasher
                    .hashPassword(password)
                    .then(passwordHash => {

                        return AdminAccountService
                            .updateAdminById(
                                database,
                                {
                                    password_hash:
                                        passwordHash
                                },
                                passwordResetToken.admin_id
                            );

                    })
                    .then(updatedAdmin => {

                        if(!updatedAdmin){

                            return res.status(400).json({
                                error: "Unable to reset password"
                            });

                        };

                        return PasswordResetTokenService
                            .markTokenAsUsed(
                                database,
                                passwordResetToken.id
                            );

                    })
                    .then(usedToken => {

                        if(!usedToken){

                            return;

                        };

                        return res.status(200).json({
                            message:
                                "Password has been reset successfully."
                        });

                    });

            })
            .catch(error => {

                next(error);

            });

    });

module.exports = PasswordResetRouter;