const express = require("express");
const PropertyPhotoRouter = express.Router();

const PropertyPhotoService = require("../dbService/propertyPhotoService");
const { requireAuth } = require("../middleware/jwtAuth");


/*
    GET ALL PHOTOS BY PROPERTY ID
*/
PropertyPhotoRouter
    .route("/property/:property_id")
    .get((req, res, next) => {

        const { property_id } = req.params;

        PropertyPhotoService.getPhotosByPropertyId(
            req.app.get("db"),
            property_id
        )
            .then(photos => {

                return res.status(200).json({
                    photos
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    GET PHOTO BY ID
*/
PropertyPhotoRouter
    .route("/:id")
    .get((req, res, next) => {

        const { id } = req.params;

        PropertyPhotoService.getPhotoById(
            req.app.get("db"),
            id
        )
            .then(photo => {

                if(!photo){

                    return res.status(404).json({
                        error: "Photo not found"
                    });

                };

                return res.status(200).json({
                    photo
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    GET COVER PHOTO BY PROPERTY ID
*/
PropertyPhotoRouter
    .route("/property/:property_id/cover")
    .get((req, res, next) => {

        const { property_id } = req.params;

        PropertyPhotoService.getCoverPhotoByPropertyId(
            req.app.get("db"),
            property_id
        )
            .then(photo => {

                if(!photo){

                    return res.status(404).json({
                        error: "Cover photo not found"
                    });

                };

                return res.status(200).json({
                    photo
                });

            })
            .catch(error => {

                next(error);

            });

    });


/*
    CREATE PROPERTY PHOTO
*/
PropertyPhotoRouter
    .route("/property/:property_id")
    .post(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { property_id } = req.params;

            const {
                image_url,
                thumbnail_url,
                alt_text,
                display_order,
                is_cover
            } = req.body;


            const newPhoto = {
                property_id,
                image_url,
                thumbnail_url,
                alt_text,
                display_order,
                is_cover
            };


            if(
                newPhoto.image_url === undefined ||
                newPhoto.image_url === null ||
                newPhoto.image_url === ""
            ){

                return res.status(400).json({
                    error: "Missing image_url in body request"
                });

            };


            PropertyPhotoService.createPropertyPhoto(
                req.app.get("db"),
                newPhoto
            )
                .then(createdPhoto => {

                    return res.status(201).json({
                        photo: createdPhoto
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    UPDATE PROPERTY PHOTO
*/
PropertyPhotoRouter
    .route("/:id")
    .patch(
        requireAuth,
        express.json(),
        (req, res, next) => {

            const { id } = req.params;

            const updatedPhoto = req.body;


            if(!Object.keys(updatedPhoto).length){

                return res.status(400).json({
                    error: "Request body cannot be empty"
                });

            };


            PropertyPhotoService.updatePhotoById(
                req.app.get("db"),
                updatedPhoto,
                id
            )
                .then(photo => {

                    if(!photo){

                        return res.status(404).json({
                            error: "Photo not found"
                        });

                    };

                    return res.status(200).json({
                        photo
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


/*
    DELETE PROPERTY PHOTO
*/
PropertyPhotoRouter
    .route("/:id")
    .delete(
        requireAuth,
        (req, res, next) => {

            const { id } = req.params;

            PropertyPhotoService.deletePhotoById(
                req.app.get("db"),
                id
            )
                .then(photo => {

                    if(!photo){

                        return res.status(404).json({
                            error: "Photo not found"
                        });

                    };

                    return res.status(200).json({
                        photo
                    });

                })
                .catch(error => {

                    next(error);

                });

        }
    );


module.exports = PropertyPhotoRouter;