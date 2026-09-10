const express = require("express");
const AmenityRouter = express.Router();

const AmenityService = require("../dbService/amenityService");
const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL AMENITIES
*/
AmenityRouter
    .route("/")
    .get((req, res, next) => {

        AmenityService.getAllAmenities(
            req.app.get("db")
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
    GET AMENITY BY ID
*/
AmenityRouter
    .route("/:id")
    .get((req, res, next) => {

        const { id } = req.params;

        AmenityService.getAmenityById(
            req.app.get("db"),
            id
        )
            .then(amenity => {

                if(!amenity){

                    return res.status(404).json({
                        error: "Amenity not found"
                    });

                };

                return res.status(200).json({
                    amenity
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    CREATE AMENITY
*/
AmenityRouter
    .route("/")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const {
                name,
                category,
                icon
            } = req.body;


            const newAmenity = {
                name,
                category,
                icon
            };


            if(
                newAmenity.name === undefined ||
                newAmenity.name === null ||
                newAmenity.name === ""
            ){

                return res.status(400).json({
                    error: "Missing name in body request"
                });

            };


            AmenityService.createAmenity(
                req.app.get("db"),
                newAmenity
            )
                .then(createdAmenity => {

                    return res.status(201).json({
                        amenity: createdAmenity
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    UPDATE AMENITY
*/
AmenityRouter
    .route("/:id")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const updatedAmenity = req.body;


            if(!Object.keys(updatedAmenity).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            AmenityService.updateAmenityById(
                req.app.get("db"),
                updatedAmenity,
                id
            )
                .then(amenity => {

                    if(!amenity){

                        return res.status(404).json({
                            error: "Amenity not found"
                        });

                    };

                    return res.status(200).json({
                        amenity
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    DELETE AMENITY
*/
AmenityRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;

            AmenityService.deleteAmenityById(
                req.app.get("db"),
                id
            )
                .then(amenity => {

                    if(!amenity){

                        return res.status(404).json({
                            error: "Amenity not found"
                        });

                    };

                    return res.status(200).json({
                        amenity
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = AmenityRouter;