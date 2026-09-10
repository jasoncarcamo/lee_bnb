const PropertyService = {
    getAllProperties(db) {
        return db
            .select("*")
            .from("properties");
    },

    getActiveProperties(db) {
        return db
            .select("*")
            .from("properties")
            .where({ status: "active" });
    },

    getPropertyById(db, id) {
        return db
            .select("*")
            .from("properties")
            .where({ id })
            .first();
    },

    getPropertyBySlug(db, slug) {
        return db
            .select("*")
            .from("properties")
            .where({ slug })
            .first();
    },

    getPropertiesByCity(db, city) {
        return db
            .select("*")
            .from("properties")
            .where({ city });
    },

    createProperty(db, newProperty) {
        return db
            .insert(newProperty)
            .into("properties")
            .returning("*")
            .then(([createdProperty]) => createdProperty);
    },

    updatePropertyById(db, updatedProperty, id) {
        
        console.log(id)
        return db
            .update({
                ...updatedProperty,
                updated_at: new Date()
            })
            .from("properties")
            .where({ id })
            .returning("*")
            .then(([updatedProperty]) => updatedProperty);
    },

    deletePropertyById(db, id) {
        return db
            .delete()
            .from("properties")
            .where({ id })
            .returning("*")
            .then(([deletedProperty]) => deletedProperty);
    }
};

module.exports = PropertyService;