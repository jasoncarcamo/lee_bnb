const express = require("express");
const PropertyRouter = express.Router();

const PropertyService = require("../dbService/propertyService");
const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL PROPERTIES
*/
PropertyRouter
    .route("/")
    .get((req, res, next) => {

        PropertyService.getAllProperties(
            req.app.get("db")
        )
            .then(properties => {

                return res.status(200).json({
                    properties
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    GET PROPERTY BY ID
*/
PropertyRouter
    .route("/:id")
    .get((req, res, next) => {

        const { id } = req.params;

        PropertyService.getPropertyById(
            req.app.get("db"),
            id
        )
            .then(property => {

                if(!property){

                    return res.status(404).json({
                        error: "Property not found"
                    });

                };

                return res.status(200).json({
                    property
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    GET PROPERTY BY SLUG
*/
PropertyRouter
    .route("/slug/:slug")
    .get((req, res, next) => {

        const { slug } = req.params;

        PropertyService.getPropertyBySlug(
            req.app.get("db"),
            slug
        )
            .then(property => {

                if(!property){

                    return res.status(404).json({
                        error: "Property not found"
                    });

                };

                return res.status(200).json({
                    property
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    CREATE PROPERTY
*/
PropertyRouter
    .route("/")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                name,
                slug,
                description,
                property_type,
                address_line_1,
                address_line_2,
                city,
                state,
                postal_code,
                country,
                latitude,
                longitude,
                max_guests,
                bedrooms,
                beds,
                bathrooms,
                check_in_time,
                check_out_time,
                minimum_nights,
                base_price,
                cleaning_fee,
                currency,
                instant_booking,
                cancellation_policy,
                house_rules,
                status
            } = req.body;


            const newProperty = {
                name,
                slug,
                description,
                property_type,
                address_line_1,
                address_line_2,
                city,
                state,
                postal_code,
                country,
                latitude,
                longitude,
                max_guests,
                bedrooms,
                beds,
                bathrooms,
                check_in_time,
                check_out_time,
                minimum_nights,
                base_price,
                cleaning_fee,
                currency,
                instant_booking,
                cancellation_policy,
                house_rules,
                status
            };
            
            console.log(newProperty)


            const requiredFields = [
                "name",
                "slug",
                "description",
                "property_type",
                "city",
                "country",
                "max_guests",
                "bedrooms",
                "beds",
                "bathrooms",
                "check_in_time",
                "check_out_time",
                "minimum_nights",
                "base_price"
            ];


            for(const field of requiredFields){

                if(
                    newProperty[field] === undefined ||
                    newProperty[field] === null ||
                    newProperty[field] === ""
                ){

                    return res.status(400).json({
                        error: `Missing ${field} in body request`
                    });

                };

            };


            PropertyService.createProperty(
                req.app.get("db"),
                newProperty
            )
                .then(createdProperty => {

                    return res.status(201).json({
                        property: createdProperty
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    UPDATE PROPERTY
*/
PropertyRouter
    .route("/:id")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const updatedProperty = req.body;


            if(!Object.keys(updatedProperty).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            PropertyService.updatePropertyById(
                req.app.get("db"),
                updatedProperty,
                id
            )
                .then(property => {

                    if(!property){

                        return res.status(404).json({
                            error: "Property not found"
                        });

                    };

                    return res.status(200).json({
                        property
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    DELETE PROPERTY
*/
PropertyRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;

            PropertyService.deletePropertyById(
                req.app.get("db"),
                id
            )
                .then(property => {

                    if(!property){

                        return res.status(404).json({
                            error: "Property not found"
                        });

                    };

                    return res.status(200).json({
                        property
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = PropertyRouter;