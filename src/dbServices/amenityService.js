const AmenityService = {
    getAllAmenities(db) {
        return db
            .select("*")
            .from("amenities")
            .orderBy("name", "asc");
    },

    getAmenityById(db, id) {
        return db
            .select("*")
            .from("amenities")
            .where({ id })
            .first();
    },

    getAmenityByName(db, name) {
        return db
            .select("*")
            .from("amenities")
            .where({ name })
            .first();
    },

    getAmenitiesByCategory(db, category) {
        return db
            .select("*")
            .from("amenities")
            .where({ category });
    },

    createAmenity(db, newAmenity) {
        return db
            .insert(newAmenity)
            .into("amenities")
            .returning("*")
            .then(([createdAmenity]) => createdAmenity);
    },

    updateAmenityById(db, updatedAmenity, id) {
        return db
            .update(updatedAmenity)
            .from("amenities")
            .where({ id })
            .returning("*")
            .then(([updatedAmenity]) => updatedAmenity);
    },

    deleteAmenityById(db, id) {
        return db
            .delete()
            .from("amenities")
            .where({ id })
            .returning("*")
            .then(([deletedAmenity]) => deletedAmenity);
    }
};

module.exports = AmenityService;