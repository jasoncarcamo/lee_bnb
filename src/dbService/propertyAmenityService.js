const PropertyAmenityService = {
    getAmenitiesByPropertyId(db, property_id) {
        return db
            .select("amenities.*")
            .from("property_amenities")
            .join(
                "amenities",
                "property_amenities.amenity_id",
                "amenities.id"
            )
            .where("property_amenities.property_id", property_id)
            .orderBy("amenities.name", "asc");
    },

    getPropertiesByAmenityId(db, amenity_id) {
        return db
            .select("properties.*")
            .from("property_amenities")
            .join(
                "properties",
                "property_amenities.property_id",
                "properties.id"
            )
            .where("property_amenities.amenity_id", amenity_id);
    },

    addAmenityToProperty(db, property_id, amenity_id) {
        return db
            .insert({
                property_id,
                amenity_id
            })
            .into("property_amenities")
            .returning("*")
            .then(([propertyAmenity]) => propertyAmenity);
    },

    removeAmenityFromProperty(db, property_id, amenity_id) {
        return db
            .delete()
            .from("property_amenities")
            .where({
                property_id,
                amenity_id
            })
            .returning("*")
            .then(([removedAmenity]) => removedAmenity);
    }
};

module.exports = PropertyAmenityService;