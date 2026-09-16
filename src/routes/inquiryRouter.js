const express = require("express");
const InquiryRouter = express.Router();

const InquiryService = require("../dbService/inquiryService");
const PropertyService = require("../dbService/propertyService");

const { requireAuth } = require("../middleware/jwtAuth");


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

                return PropertyService.getPropertyById(
                    req.app.get("db"),
                    property_id
                )
                    .then(property => {

                        if(!property){

                            return res.status(404).json({
                                error: "Property not found"
                            });

                        };


                        return InquiryService.createInquiry(
                            req.app.get("db"),
                            newInquiry
                        );

                    })
                    .then(inquiry => {

                        if(!inquiry){

                            return;

                        };


                        return res.status(201).json({
                            inquiry
                        });

                    })
                    .catch(error => {

                        next(error);

                    });

            };


            InquiryService.createInquiry(
                req.app.get("db"),
                newInquiry
            )
                .then(inquiry => {

                    return res.status(201).json({
                        inquiry
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
    DELETE INQUIRY
*/
InquiryRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            InquiryService.deleteInquiryById(
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


module.exports = InquiryRouter;