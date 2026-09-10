const express = require("express");
const PropertyAmenityRouter = express.Router();

const PropertyAmenityService = require("../dbService/propertyAmenityService");
const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL AMENITIES FOR PROPERTY
*/
PropertyAmenityRouter
    .route("/property/:property_id")
    .get((req, res, next) => {

        const { property_id } = req.params;

        PropertyAmenityService.getAmenitiesByPropertyId(
            req.app.get("db"),
            property_id
        )
            .then(amenities => {

                return res.status(200).json({
                    amenities
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    ADD AMENITY TO PROPERTY
*/
PropertyAmenityRouter
    .route("/property/:property_id")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { property_id } = req.params;

            const {
                amenity_id
            } = req.body;


            const propertyAmenity = {
                property_id,
                amenity_id
            };
            
            console.log(propertyAmenity);


            if(
                !amenity_id
            ){

                return res.status(400).json({
                    error: "Missing amenity_id in body request"
                });

            };


            PropertyAmenityService.addAmenityToProperty(
                req.app.get("db"),
                propertyAmenity.property_id,
                propertyAmenity.amenity_id
            )
                .then(createdPropertyAmenity => {

                    return res.status(201).json({
                        propertyAmenity: createdPropertyAmenity
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    GET PROPERTY AMENITY
*/
PropertyAmenityRouter
    .route("/property/:property_id/amenity/:amenity_id")
    .get((req, res, next) => {

        const {
            property_id,
            amenity_id
        } = req.params;


        PropertyAmenityService.getPropertyAmenity(
            req.app.get("db"),
            property_id,
            amenity_id
        )
            .then(propertyAmenity => {

                if(!propertyAmenity){

                    return res.status(404).json({
                        error: "Property amenity not found"
                    });

                };

                return res.status(200).json({
                    propertyAmenity
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    REMOVE AMENITY FROM PROPERTY
*/
PropertyAmenityRouter
    .route("/property/:property_id/amenity/:amenity_id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const {
                property_id,
                amenity_id
            } = req.params;


            PropertyAmenityService.removeAmenityFromProperty(
                req.app.get("db"),
                property_id,
                amenity_id
            )
                .then(propertyAmenity => {

                    if(!propertyAmenity){

                        return res.status(404).json({
                            error: "Property amenity not found"
                        });

                    };

                    return res.status(200).json({
                        propertyAmenity
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = PropertyAmenityRouter;