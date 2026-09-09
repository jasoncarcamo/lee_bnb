const PropertyPricingService = {
    getPricingByPropertyId(db, property_id) {
        return db
            .select("*")
            .from("property_pricing")
            .where({ property_id })
            .orderBy("start_date", "asc");
    },

    getPricingById(db, id) {
        return db
            .select("*")
            .from("property_pricing")
            .where({ id })
            .first();
    },

    getPricingForDate(db, property_id, date) {
        return db
            .select("*")
            .from("property_pricing")
            .where({ property_id })
            .where("start_date", "<=", date)
            .where("end_date", ">=", date)
            .orderBy("start_date", "desc")
            .first();
    },

    createPricing(db, newPricing) {
        return db
            .insert(newPricing)
            .into("property_pricing")
            .returning("*")
            .then(([createdPricing]) => createdPricing);
    },

    updatePricingById(db, updatedPricing, id) {
        return db
            .update(updatedPricing)
            .from("property_pricing")
            .where({ id })
            .returning("*")
            .then(([updatedPricing]) => updatedPricing);
    },

    deletePricingById(db, id) {
        return db
            .delete()
            .from("property_pricing")
            .where({ id })
            .returning("*")
            .then(([deletedPricing]) => deletedPricing);
    }
};

module.exports = PropertyPricingService;