const express = require("express");
const InquiryRouter = express.Router();

const InquiryService = require("../dbService/inquiryService");
const PropertyService = require("../dbService/propertyService");

const { requireAuth } = require("../middleware/jwtAuth");
const notificationService = require("../dbService/notificationService");
const InquiryTokenService = require(
    "../securityService/inquiryTokenService"
);
const InquiryEmailService = require(
    "../securityService/inquiryEmailService"
);


/*
    GET ALL INQUIRIES
*/
InquiryRouter
    .route("/")
    .get(
        requireAuth,
        (req, res, next) => {

            InquiryService.getAllInquiries(
                req.app.get("db")
            )
                .then(inquiries => {

                    return res.status(200).json({
                        inquiries
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET INQUIRIES BY PROPERTY
*/
InquiryRouter
    .route("/property/:property_id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { property_id } = req.params;


            InquiryService.getInquiriesByPropertyId(
                req.app.get("db"),
                property_id
            )
                .then(inquiries => {

                    return res.status(200).json({
                        inquiries
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET INQUIRIES BY STATUS
*/
InquiryRouter
    .route("/status/:status")
    .get(
        requireAuth,
        (req, res, next) => {

            const { status } = req.params;


            InquiryService.getInquiriesByStatus(
                req.app.get("db"),
                status
            )
                .then(inquiries => {

                    return res.status(200).json({
                        inquiries
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET INQUIRY BY ID
*/
InquiryRouter
    .route("/:id")
    .get(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            InquiryService.getInquiryById(
                req.app.get("db"),
                id
            )
                .then(inquiry => {

                    if(!inquiry){

                        return res.status(404).json({
                            error: "Inquiry not found"
                        });

                    };


                    return res.status(200).json({
                        inquiry
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );

/*
    CREATE INQUIRY
*/
InquiryRouter
    .route("/")
    .post(
        express.json(),
        (req, res, next) => {

            const {
                property_id,
                first_name,
                last_name,
                email,
                phone,
                subject,
                message,
                check_in,
                check_out,
                guests_count
            } = req.body;


            const newInquiry = {

                property_id:
                    property_id || null,

                first_name,

                last_name:
                    last_name || null,

                email,

                phone:
                    phone || null,

                subject:
                    subject || null,

                message,

                check_in:
                    check_in || null,

                check_out:
                    check_out || null,

                guests_count:
                    guests_count || null,

                status:
                    "new"

            };


            const requiredFields = [
                "first_name",
                "email",
                "message"
            ];


            for(const field of requiredFields){

                if(
                    newInquiry[field] === undefined ||
                    newInquiry[field] === null ||
                    newInquiry[field] === ""
                ){

                    return res.status(400).json({
                        error: `Missing ${field} in body request`
                    });

                };

            };


            /*
                VALIDATE OPTIONAL DATES
            */
            if(
                check_in &&
                check_out
            ){

                const checkInDate =
                    new Date(
                        `${check_in}T00:00:00`
                    );

                const checkOutDate =
                    new Date(
                        `${check_out}T00:00:00`
                    );


                if(
                    Number.isNaN(
                        checkInDate.getTime()
                    ) ||
                    Number.isNaN(
                        checkOutDate.getTime()
                    )
                ){

                    return res.status(400).json({
                        error: "Invalid inquiry dates"
                    });

                };


                if(
                    checkOutDate <=
                    checkInDate
                ){

                    return res.status(400).json({
                        error: "check_out must be after check_in"
                    });

                };

            };


            /*
                PROPERTY IS OPTIONAL
            */
            if(property_id){

                return PropertyService
                    .getPropertyById(
                        req.app.get("db"),
                        property_id
                    )
                    .then(property => {

                        if(!property){

                            return res.status(404).json({
                                error: "Property not found"
                            });

                        };


                        return InquiryService
                            .createInquiry(
                                req.app.get("db"),
                                newInquiry
                            )
                            .then(inquiry => {

                                const newNotification = {
                                    type: "new_inquiry",
                                    title: "New Inquiry",
                                    message:
                                        `${inquiry.first_name} submitted a new inquiry.`,
                                    property_id:
                                        inquiry.property_id,
                                    reservation_id:
                                        null,
                                    conversation_id:
                                        null,
                                    inquiry_id:
                                        inquiry.id,
                                    is_read:
                                        false
                                };


                                return notificationService
                                    .createNotification(
                                        req.app.get("db"),
                                        newNotification
                                    )
                                    .then(() => {

                                        return res.status(201).json({
                                            inquiry
                                        });

                                    });

                            });

                    })
                    .catch(error => {

                        next(error);

                    });

            };


            /*
                CREATE INQUIRY WITHOUT PROPERTY
            */
            return InquiryService
                .createInquiry(
                    req.app.get("db"),
                    newInquiry
                )
                .then(inquiry => {

                    const newNotification = {
                        type: "new_inquiry",
                        title: "New Inquiry",
                        message:
                            `${inquiry.first_name} submitted a new inquiry.`,
                        property_id:
                            inquiry.property_id,
                        reservation_id:
                            null,
                        conversation_id:
                            null,
                        inquiry_id:
                            inquiry.id,
                        is_read:
                            false
                    };


                    return notificationService
                        .createNotification(
                            req.app.get("db"),
                            newNotification
                        )
                        .then(() => {

                            return res.status(201).json({
                                inquiry
                            });

                        });

                })
                .catch(error => {

                    next(error);

                });

        }
    );
    
/*
    UPDATE INQUIRY
*/
InquiryRouter
    .route("/:id")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const updatedInquiry = {
                ...req.body
            };


            if(!Object.keys(updatedInquiry).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            /*
                PROTECT DATABASE-CONTROLLED FIELDS
            */
            delete updatedInquiry.id;
            delete updatedInquiry.created_at;
            delete updatedInquiry.updated_at;


            InquiryService.updateInquiryById(
                req.app.get("db"),
                updatedInquiry,
                id
            )
                .then(inquiry => {

                    if(!inquiry){

                        return res.status(404).json({
                            error: "Inquiry not found"
                        });

                    };


                    const newNotification = {
                        type: "inquiry_updated",
                        title: "Inquiry Updated",
                        message:
                            `Inquiry from ${inquiry.first_name}${inquiry.last_name ? ` ${inquiry.last_name}` : ""} was updated.`,
                        property_id:
                            inquiry.property_id,
                        reservation_id:
                            null,
                        conversation_id:
                            null,
                        inquiry_id:
                            inquiry.id,
                        is_read:
                            false
                    };


                    return notificationService
                        .deleteNotificationByInquiryIdAndType(
                            req.app.get("db"),
                            inquiry.id,
                            "inquiry_updated"
                        )
                        .then(() => {

                            return notificationService
                                .createNotification(
                                    req.app.get("db"),
                                    newNotification
                                );

                        })
                        .then(() => {

                            return res.status(200).json({
                                inquiry
                            });

                        });

                })
                .catch(error => {

                    next(error);

                });

        }
    );

/*
    DELETE INQUIRY
*/
InquiryRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            InquiryService.getInquiryById(
                req.app.get("db"),
                id
            )
                .then(inquiry => {

                    if(!inquiry){

                        return res.status(404).json({
                            error: "Inquiry not found"
                        });

                    };


                    const newNotification = {
                        type: "inquiry_deleted",
                        title: "Inquiry Deleted",
                        message:
                            `Inquiry from ${inquiry.first_name}${inquiry.last_name ? ` ${inquiry.last_name}` : ""} (${inquiry.email}) was deleted.`,
                        property_id:
                            inquiry.property_id,
                        reservation_id:
                            null,
                        conversation_id:
                            null,
                        inquiry_id:
                            null,
                        is_read:
                            false
                    };


                    return notificationService
                        .deleteNotificationByInquiryIdAndType(
                            req.app.get("db"),
                            inquiry.id,
                            "new_inquiry"
                        )
                        .then(() => {

                            return InquiryService
                                .deleteInquiryById(
                                    req.app.get("db"),
                                    inquiry.id
                                );

                        })
                        .then(deletedInquiry => {

                            return notificationService
                                .createNotification(
                                    req.app.get("db"),
                                    newNotification
                                )
                                .then(() => {

                                    return res.status(200).json({
                                        inquiry: deletedInquiry
                                    });

                                });

                        });

                })
                .catch(error => {

                    next(error);

                });

        }
    );

InquiryRouter
    .route("/admin")
    .post(
        requireAuth,
        express.json(),
        async (req, res, next) => {

            try {

                const {

                    property_id,
                    first_name,
                    last_name,
                    email,
                    phone,
                    subject,
                    message,
                    check_in,
                    check_out,
                    guests_count

                } = req.body;

                if (
                    !first_name ||
                    !email ||
                    !message
                ) {

                    return res.status(400).json({

                        error:
                            "first_name, email, and message are required"

                    });

                }

                if (
                    (check_in && !check_out) ||
                    (!check_in && check_out)
                ) {

                    return res.status(400).json({

                        error:
                            "Provide both check_in and check_out"

                    });

                }

                if (
                    check_in &&
                    check_out &&
                    (
                        !/^\d{4}-\d{2}-\d{2}$/.test(check_in) ||
                        !/^\d{4}-\d{2}-\d{2}$/.test(check_out) ||
                        Number.isNaN(Date.parse(check_in)) ||
                        Number.isNaN(Date.parse(check_out)) ||
                        check_out <= check_in
                    )
                ) {

                    return res.status(400).json({

                        error: "Invalid inquiry dates"

                    });

                }

                if (
                    guests_count !== undefined &&
                    guests_count !== null &&
                    (
                        !Number.isInteger(guests_count) ||
                        guests_count <= 0
                    )
                ) {

                    return res.status(400).json({

                        error:
                            "guests_count must be a positive integer"

                    });

                }

                const db = req.app.get("db");

                if (property_id) {

                    const property =
                        await PropertyService.getPropertyById(
                            db,
                            property_id
                        );

                    if (!property) {

                        return res.status(404).json({

                            error: "Property not found"

                        });

                    }

                }

                const inquiry =
                    await InquiryService.createInquiry(
                        db,
                        {

                            property_id:
                                property_id || null,

                            first_name,

                            last_name:
                                last_name || null,

                            email,

                            phone:
                                phone || null,

                            subject:
                                subject || null,

                            message,

                            check_in:
                                check_in || null,

                            check_out:
                                check_out || null,

                            guests_count:
                                guests_count || null,

                            created_by: "admin",

                            status: "new"

                        }
                    );

                return res.status(201).json({

                    inquiry

                });

            } catch (error) {

                next(error);

            }

        }
    );
    
InquiryRouter
    .route("/:id/send")
    .post(
        requireAuth,
        async (req, res, next) => {

            const db = req.app.get("db");

            let createdToken = null;

            try {

                const { id } = req.params;

                const inquiry =
                    await InquiryService.getInquiryById(
                        db,
                        id
                    );

                if (!inquiry) {

                    return res.status(404).json({

                        error: "Inquiry not found"

                    });

                }

                if (
                    inquiry.status === "confirmed" ||
                    inquiry.status === "canceled"
                ) {

                    return res.status(409).json({

                        error:
                            "This inquiry has already been resolved"

                    });

                }

                const token =
                    InquiryTokenService.generateToken();

                createdToken =
                    await InquiryService.createConfirmationToken(
                        db,
                        {

                            inquiry_id: inquiry.id,

                            token_hash:
                                InquiryTokenService.hashToken(
                                    token
                                ),

                            expires_at:
                                InquiryTokenService.getExpirationDate()

                        }
                    );

                await InquiryEmailService
                    .sendInquiryConfirmation(
                        inquiry,
                        token
                    );

                const updatedInquiry =
                    await db.transaction(
                        async trx => {

                            const currentInquiry =
                                await InquiryService
                                    .getInquiryByIdForUpdate(
                                        trx,
                                        inquiry.id
                                    );

                            if (
                                !currentInquiry ||
                                (
                                    currentInquiry.status !== "new" &&
                                    currentInquiry.status !==
                                        "pending_confirmation"
                                )
                            ) {

                                throw new Error(
                                    "Inquiry is no longer available to send"
                                );

                            }

                            await InquiryService
                                .deleteOtherConfirmationTokens(
                                    trx,
                                    inquiry.id,
                                    createdToken.id
                                );

                            return InquiryService
                                .updateInquiryStatus(
                                    trx,
                                    inquiry.id,
                                    "pending_confirmation",
                                    {

                                        sent_at: new Date(),

                                        responded_at: null

                                    }
                                );

                        }
                    );

                return res.status(200).json({

                    inquiry: updatedInquiry,

                    message:
                        "Inquiry email accepted by email provider"

                });

            } catch (error) {

                if (createdToken) {

                    try {

                        await db
                            .from(
                                "inquiry_confirmation_tokens"
                            )
                            .where({
                                id: createdToken.id
                            })
                            .delete();

                    } catch (cleanupError) {

                        console.error(
                            "Inquiry token cleanup failed:",
                            cleanupError.message
                        );

                    }

                }

                next(error);

            }

        }
    );
    
InquiryRouter
    .route("/confirmation/:token")
    .get(
        async (req, res, next) => {

            try {

                const db = req.app.get("db");

                const tokenHash =
                    InquiryTokenService.hashToken(
                        req.params.token
                    );

                const tokenRecord =
                    await InquiryService
                        .getConfirmationTokenByHash(
                            db,
                            tokenHash
                        );

                if (
                    !tokenRecord ||
                    InquiryTokenService.isTokenUsed(
                        tokenRecord.used_at
                    ) ||
                    InquiryTokenService.isTokenExpired(
                        tokenRecord.expires_at
                    )
                ) {

                    return res.status(410).json({

                        error:
                            "This inquiry link is invalid or expired"

                    });

                }

                const inquiry =
                    await InquiryService.getInquiryById(
                        db,
                        tokenRecord.inquiry_id
                    );

                if (
                    !inquiry ||
                    inquiry.status !==
                        "pending_confirmation"
                ) {

                    return res.status(410).json({

                        error:
                            "This inquiry is no longer awaiting confirmation"

                    });

                }

                return res.status(200).json({

                    inquiry: {

                        id: inquiry.id,

                        property_id:
                            inquiry.property_id,

                        first_name:
                            inquiry.first_name,

                        last_name:
                            inquiry.last_name,

                        subject:
                            inquiry.subject,

                        message:
                            inquiry.message,

                        check_in:
                            inquiry.check_in,

                        check_out:
                            inquiry.check_out,

                        guests_count:
                            inquiry.guests_count,

                        status:
                            inquiry.status

                    }

                });

            } catch (error) {

                next(error);

            }

        }
    );
    
InquiryRouter
    .route("/confirmation/:token/respond")
    .post(
        express.json(),
        async (req, res, next) => {

            try {

                const { decision } = req.body;

                if (
                    decision !== "confirm" &&
                    decision !== "cancel"
                ) {

                    return res.status(400).json({

                        error:
                            "decision must be confirm or cancel"

                    });

                }

                const tokenHash =
                    InquiryTokenService.hashToken(
                        req.params.token
                    );

                const db = req.app.get("db");

                const result =
                    await db.transaction(
                        async trx => {

                            const tokenRecord =
                                await InquiryService
                                    .getConfirmationTokenByHashForUpdate(
                                        trx,
                                        tokenHash
                                    );

                            if (
                                !tokenRecord ||
                                InquiryTokenService.isTokenUsed(
                                    tokenRecord.used_at
                                ) ||
                                InquiryTokenService.isTokenExpired(
                                    tokenRecord.expires_at
                                )
                            ) {

                                return null;

                            }

                            const inquiry =
                                await InquiryService
                                    .getInquiryByIdForUpdate(
                                        trx,
                                        tokenRecord.inquiry_id
                                    );

                            if (
                                !inquiry ||
                                inquiry.status !==
                                    "pending_confirmation"
                            ) {

                                return null;

                            }

                            const status =
                                decision === "confirm"
                                    ? "confirmed"
                                    : "canceled";

                            const updatedInquiry =
                                await InquiryService
                                    .updateInquiryStatus(
                                        trx,
                                        inquiry.id,
                                        status,
                                        {

                                            responded_at:
                                                new Date()

                                        }
                                    );

                            await InquiryService
                                .markConfirmationTokenUsed(
                                    trx,
                                    tokenRecord.id
                                );

                            await InquiryService
                                .deleteOtherConfirmationTokens(
                                    trx,
                                    inquiry.id,
                                    tokenRecord.id
                                );

                            return {

                                id: updatedInquiry.id,

                                status:
                                    updatedInquiry.status,

                                responded_at:
                                    updatedInquiry.responded_at

                            };

                        }
                    );

                if (!result) {

                    return res.status(410).json({

                        error:
                            "This inquiry link is invalid, expired, or already resolved"

                    });

                }

                return res.status(200).json({

                    inquiry: result,

                    message:
                        decision === "confirm"
                            ? "Inquiry confirmed"
                            : "Inquiry canceled"

                });

            } catch (error) {

                next(error);

            }

        }
    );

module.exports = InquiryRouter;