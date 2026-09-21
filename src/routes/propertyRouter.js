const express = require("express");
const PropertyRouter = express.Router();

const PropertyService = require("../dbService/propertyService");
const { requireAuth } = require("../middleware/jwtAuth");
const ReservationService = require("../dbService/reservationService");

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
                status,
                blocked_dates,
                amenities
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
                status,
            };

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
            
            if(!Array.isArray(blocked_dates)){

                return res.status(400).json({
                    error: "blocked_dates must be an array"
                });

            };


            const today = new Date();

            const todayString = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, "0"),
                String(today.getDate()).padStart(2, "0")
            ].join("-");


            for(const date of blocked_dates){

                if(
                    typeof date !== "string" ||
                    !/^\d{4}-\d{2}-\d{2}$/.test(date)
                ){

                    return res.status(400).json({
                        error: "Invalid blocked date"
                    });

                };


                const parsedDate = new Date(
                    `${date}T12:00:00`
                );


                if(
                    Number.isNaN(parsedDate.getTime()) ||
                    parsedDate.getFullYear() !== Number(date.slice(0, 4)) ||
                    parsedDate.getMonth() + 1 !== Number(date.slice(5, 7)) ||
                    parsedDate.getDate() !== Number(date.slice(8, 10))
                ){

                    return res.status(400).json({
                        error: "Invalid blocked date"
                    });

                };


                if(date < todayString){

                    return res.status(400).json({
                        error: "Cannot block past dates"
                    });

                };

            };


            if(
                new Set(blocked_dates).size !== blocked_dates.length
            ){

                return res.status(400).json({
                    error: "Duplicate blocked dates"
                });

            };

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
            
            if(!Array.isArray(amenities)){

                return res.status(400).json({
                    error: "amenities must be an array"
                });

            };


            const normalizedAmenities = [];

            const amenityNames = new Set();


            for(const amenity of amenities){

                if(typeof amenity !== "string"){

                    return res.status(400).json({
                        error: "Each amenity must be a name"
                    });

                };


                const name = amenity.trim();

                const normalizedName = name.toLowerCase();


                if(!name){

                    return res.status(400).json({
                        error: "Amenity names cannot be empty"
                    });

                };


                if(amenityNames.has(normalizedName)){

                    return res.status(400).json({
                        error: `Duplicate amenity: ${name}`
                    });

                };


                amenityNames.add(normalizedName);

                normalizedAmenities.push(name);

            };


            PropertyService.createPropertyWithAvailability(
                req.app.get("db"),
                newProperty,
                blocked_dates,
                normalizedAmenities
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


                    return ReservationService
                        .hasReservationsByPropertyId(
                            req.app.get("db"),
                            id
                        )
                        .then(hasReservations => {

                            if(hasReservations){

                                return res.status(409).json({
                                    error:
                                        "This property has reservation history and cannot be permanently deleted. Set the property to inactive instead."
                                });

                            };


                            return PropertyService
                                .deletePropertyById(
                                    req.app.get("db"),
                                    id
                                )
                                .then(deletedProperty => {

                                    return res.status(200).json({
                                        property:
                                            deletedProperty
                                    });

                                });

                        });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = PropertyRouter;