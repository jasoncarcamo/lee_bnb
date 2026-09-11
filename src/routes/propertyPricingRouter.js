const express = require("express");
const PropertyPricingRouter = express.Router();

const PropertyPricingService = require("../dbService/propertyPricingService");
const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL PRICING BY PROPERTY
*/
PropertyPricingRouter
    .route("/property/:property_id")
    .get((req, res, next) => {

        const { property_id } = req.params;


        PropertyPricingService.getPricingByPropertyId(
            req.app.get("db"),
            property_id
        )
            .then(pricing => {

                return res.status(200).json({
                    pricing
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    GET PRICING BY ID
*/
PropertyPricingRouter
    .route("/:id")
    .get((req, res, next) => {

        const { id } = req.params;


        PropertyPricingService.getPricingById(
            req.app.get("db"),
            id
        )
            .then(pricing => {

                if(!pricing){

                    return res.status(404).json({
                        error: "Pricing not found"
                    });

                };


                return res.status(200).json({
                    pricing
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    GET PRICING FOR PROPERTY ON DATE
*/
PropertyPricingRouter
    .route("/property/:property_id/date/:date")
    .get((req, res, next) => {

        const {
            property_id,
            date
        } = req.params;


        PropertyPricingService.getPricingForDate(
            req.app.get("db"),
            property_id,
            date
        )
            .then(pricing => {

                if(!pricing){

                    return res.status(404).json({
                        error: "Pricing not found for this date"
                    });

                };


                return res.status(200).json({
                    pricing
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    CREATE PRICING
*/
PropertyPricingRouter
    .route("/property/:property_id")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { property_id } = req.params;


            const {
                name,
                start_date,
                end_date,
                nightly_price,
                minimum_nights
            } = req.body;


            const newPricing = {
                property_id,
                name,
                start_date,
                end_date,
                nightly_price,
                minimum_nights
            };


            const requiredFields = [
                "start_date",
                "end_date",
                "nightly_price"
            ];


            for(const field of requiredFields){

                if(
                    newPricing[field] === undefined ||
                    newPricing[field] === null ||
                    newPricing[field] === ""
                ){

                    return res.status(400).json({
                        error: `Missing ${field} in body request`
                    });

                };

            };


            PropertyPricingService.createPricing(
                req.app.get("db"),
                newPricing
            )
                .then(createdPricing => {

                    return res.status(201).json({
                        pricing: createdPricing
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    UPDATE PRICING
*/
PropertyPricingRouter
    .route("/:id")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const updatedPricing = req.body;


            if(!Object.keys(updatedPricing).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            PropertyPricingService.updatePricingById(
                req.app.get("db"),
                updatedPricing,
                id
            )
                .then(pricing => {

                    if(!pricing){

                        return res.status(404).json({
                            error: "Pricing not found"
                        });

                    };


                    return res.status(200).json({
                        pricing
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    DELETE PRICING
*/
PropertyPricingRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;


            PropertyPricingService.deletePricingById(
                req.app.get("db"),
                id
            )
                .then(pricing => {

                    if(!pricing){

                        return res.status(404).json({
                            error: "Pricing not found"
                        });

                    };


                    return res.status(200).json({
                        pricing
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = PropertyPricingRouter;