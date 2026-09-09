const InquiryService = {
    getAllInquiries(db) {
        return db
            .select("*")
            .from("inquiries")
            .orderBy("created_at", "desc");
    },

    getInquiryById(db, id) {
        return db
            .select("*")
            .from("inquiries")
            .where({ id })
            .first();
    },

    getInquiriesByPropertyId(db, property_id) {
        return db
            .select("*")
            .from("inquiries")
            .where({ property_id })
            .orderBy("created_at", "desc");
    },

    getInquiriesByStatus(db, status) {
        return db
            .select("*")
            .from("inquiries")
            .where({ status })
            .orderBy("created_at", "desc");
    },

    createInquiry(db, newInquiry) {
        return db
            .insert(newInquiry)
            .into("inquiries")
            .returning("*")
            .then(([createdInquiry]) => createdInquiry);
    },

    updateInquiryById(db, updatedInquiry, id) {
        return db
            .update({
                ...updatedInquiry,
                updated_at: new Date()
            })
            .from("inquiries")
            .where({ id })
            .returning("*")
            .then(([updatedInquiry]) => updatedInquiry);
    },

    deleteInquiryById(db, id) {
        return db
            .delete()
            .from("inquiries")
            .where({ id })
            .returning("*")
            .then(([deletedInquiry]) => deletedInquiry);
    }
};

module.exports = InquiryService;