const PropertyPhotoService = {
    getPhotosByPropertyId(db, property_id) {
        return db
            .select("*")
            .from("property_photos")
            .where({ property_id })
            .orderBy("display_order", "asc");
    },

    getPhotoById(db, id) {
        return db
            .select("*")
            .from("property_photos")
            .where({ id })
            .first();
    },

    getCoverPhotoByPropertyId(db, property_id) {
        return db
            .select("*")
            .from("property_photos")
            .where({
                property_id,
                is_cover: true
            })
            .first();
    },

    createPropertyPhoto(db, newPhoto) {
        return db
            .insert(newPhoto)
            .into("property_photos")
            .returning("*")
            .then(([createdPhoto]) => createdPhoto);
    },

    updatePhotoById(db, updatedPhoto, id) {
        return db
            .update(updatedPhoto)
            .from("property_photos")
            .where({ id })
            .returning("*")
            .then(([updatedPhoto]) => updatedPhoto);
    },

    deletePhotoById(db, id) {
        return db
            .delete()
            .from("property_photos")
            .where({ id })
            .returning("*")
            .then(([deletedPhoto]) => deletedPhoto);
    }
};

module.exports = PropertyPhotoService;