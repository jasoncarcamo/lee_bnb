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
    },
    getInquiriesByPropertyIdAndEmail(
        db,
        property_id,
        email
    ) {
        return db
            .select("*")
            .from("inquiries")
            .where({
                property_id,
                email
            });
    },

    deleteInquiriesByPropertyIdAndEmail(
        db,
        property_id,
        email
    ) {
        return db
            .delete()
            .from("inquiries")
            .where({
                property_id,
                email
            })
            .returning("*");
    },
    deleteNotificationsByInquiryIdsAndType(
        db,
        inquiry_ids,
        type
    ) {

        if(!inquiry_ids.length){

            return Promise.resolve([]);
        };


        return db
            .delete()
            .from("notifications")
            .whereIn(
                "inquiry_id",
                inquiry_ids
            )
            .where({
                type
            })
            .returning("*");
    },
    createConfirmationToken(db, newToken) {
        return db
            .insert(newToken)
            .into("inquiry_confirmation_tokens")
            .returning("*")
            .then(([createdToken]) => createdToken);
    },

    getConfirmationTokenByHash(db, token_hash) {
        return db
            .select("*")
            .from("inquiry_confirmation_tokens")
            .where({ token_hash })
            .first();
    },

    markConfirmationTokenUsed(db, id) {
        return db
            .update({
                used_at: new Date()
            })
            .from("inquiry_confirmation_tokens")
            .where({ id })
            .whereNull("used_at")
            .returning("*")
            .then(([updatedToken]) => updatedToken);
    },

    deleteConfirmationTokensByInquiryId(db, inquiry_id) {
        return db
            .delete()
            .from("inquiry_confirmation_tokens")
            .where({ inquiry_id })
            .returning("*");
    },

    getConfirmationTokensByInquiryId(db, inquiry_id) {
        return db
            .select("*")
            .from("inquiry_confirmation_tokens")
            .where({ inquiry_id })
            .orderBy("created_at", "desc");
    },
    getConfirmationTokenByHashForUpdate(
        db,
        token_hash
    ) {

        return db
            .select("*")
            .from("inquiry_confirmation_tokens")
            .where({ token_hash })
            .forUpdate()
            .first();

    },

    getInquiryByIdForUpdate(db, id) {

        return db
            .select("*")
            .from("inquiries")
            .where({ id })
            .forUpdate()
            .first();

    },

    deleteOtherConfirmationTokens(
        db,
        inquiry_id,
        keep_token_id
    ) {

        return db
            .from("inquiry_confirmation_tokens")
            .where({ inquiry_id })
            .whereNot({ id: keep_token_id })
            .delete();

    },

    updateInquiryStatus(
        db,
        id,
        status,
        additionalFields = {}
    ) {

        return db
            .from("inquiries")
            .where({ id })
            .update({

                status,

                ...additionalFields,

                updated_at: new Date()

            })
            .returning("*")
            .then(([inquiry]) => inquiry);

    }
};

module.exports = InquiryService;