const PropertyAvailabilityService = {
    getAvailabilityByPropertyId(db, property_id) {
        return db
            .select("*")
            .from("property_availability")
            .where({ property_id })
            .orderBy("date", "asc");
    },

    getAvailabilityByDate(db, property_id, date) {
        return db
            .select("*")
            .from("property_availability")
            .where({
                property_id,
                date
            })
            .first();
    },

    getAvailabilityBetweenDates(db, property_id, startDate, endDate) {
        return db
            .select("*")
            .from("property_availability")
            .where({ property_id })
            .whereBetween("date", [startDate, endDate])
            .orderBy("date", "asc");
    },

    createAvailability(db, newAvailability) {
        return db
            .insert(newAvailability)
            .into("property_availability")
            .returning("*")
            .then(([createdAvailability]) => createdAvailability);
    },

    updateAvailabilityByDate(db, updatedAvailability, property_id, date) {
        return db
            .update(updatedAvailability)
            .from("property_availability")
            .where({
                property_id,
                date
            })
            .returning("*")
            .then(([updatedAvailability]) => updatedAvailability);
    },

    deleteAvailabilityByDate(db, property_id, date) {
        return db
            .delete()
            .from("property_availability")
            .where({
                property_id,
                date
            })
            .returning("*")
            .then(([deletedAvailability]) => deletedAvailability);
    }
};

module.exports = PropertyAvailabilityService;