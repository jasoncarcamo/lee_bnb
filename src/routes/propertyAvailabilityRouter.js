const express = require("express");
const PropertyAvailabilityRouter = express.Router();

const PropertyAvailabilityService = require("../dbService/propertyAvailabilityService");
const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL AVAILABILITY BY PROPERTY
*/
PropertyAvailabilityRouter
    .route("/property/:property_id")
    .get((req, res, next) => {

        const { property_id } = req.params;


        PropertyAvailabilityService.getAvailabilityByPropertyId(
            req.app.get("db"),
            property_id
        )
            .then(availability => {

                return res.status(200).json({
                    availability
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    GET AVAILABILITY BY PROPERTY AND DATE
*/
PropertyAvailabilityRouter
    .route("/property/:property_id/date/:date")
    .get((req, res, next) => {

        const {
            property_id,
            date
        } = req.params;


        PropertyAvailabilityService.getAvailabilityByDate(
            req.app.get("db"),
            property_id,
            date
        )
            .then(availability => {

                if(!availability){

                    return res.status(404).json({
                        error: "Availability not found"
                    });

                };


                return res.status(200).json({
                    availability
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    GET AVAILABILITY BETWEEN DATES
*/
PropertyAvailabilityRouter
    .route("/property/:property_id/between/:startDate/:endDate")
    .get((req, res, next) => {

        const {
            property_id,
            startDate,
            endDate
        } = req.params;


        PropertyAvailabilityService.getAvailabilityBetweenDates(
            req.app.get("db"),
            property_id,
            startDate,
            endDate
        )
            .then(availability => {

                return res.status(200).json({
                    availability
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    CREATE AVAILABILITY
*/
PropertyAvailabilityRouter
    .route("/property/:property_id")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { property_id } = req.params;


            const {
                date,
                is_available,
                nightly_price,
                minimum_nights
            } = req.body;


            const newAvailability = {
                property_id,
                date,
                is_available,
                nightly_price,
                minimum_nights
            };


            const requiredFields = [
                "date",
                "is_available"
            ];


            for(const field of requiredFields){

                if(
                    newAvailability[field] === undefined ||
                    newAvailability[field] === null ||
                    newAvailability[field] === ""
                ){

                    return res.status(400).json({
                        error: `Missing ${field} in body request`
                    });

                };

            };


            PropertyAvailabilityService.createAvailability(
                req.app.get("db"),
                newAvailability
            )
                .then(createdAvailability => {

                    return res.status(201).json({
                        availability: createdAvailability
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    UPDATE AVAILABILITY BY DATE
*/
PropertyAvailabilityRouter
    .route("/property/:property_id/date/:date")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                property_id,
                date
            } = req.params;


            const updatedAvailability = req.body;


            if(!Object.keys(updatedAvailability).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            PropertyAvailabilityService.updateAvailabilityByDate(
                req.app.get("db"),
                updatedAvailability,
                property_id,
                date
            )
                .then(availability => {

                    if(!availability){

                        return res.status(404).json({
                            error: "Availability not found"
                        });

                    };


                    return res.status(200).json({
                        availability
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    DELETE AVAILABILITY BY DATE
*/
PropertyAvailabilityRouter
    .route("/property/:property_id/date/:date")
    .delete(
        requireAuth,
        (req, res, next) => {

            const {
                property_id,
                date
            } = req.params;


            PropertyAvailabilityService.deleteAvailabilityByDate(
                req.app.get("db"),
                property_id,
                date
            )
                .then(availability => {

                    if(!availability){

                        return res.status(404).json({
                            error: "Availability not found"
                        });

                    };


                    return res.status(200).json({
                        availability
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = PropertyAvailabilityRouter;