const GuestConversationAccessService = {
    getAccessByTokenHash(db, access_token_hash) {
        return db
            .select("*")
            .from("guest_conversation_access")
            .where({ access_token_hash })
            .first();
    },

    getAccessByConversationId(db, conversation_id) {
        return db
            .select("*")
            .from("guest_conversation_access")
            .where({ conversation_id });
    },

    createConversationAccess(db, newAccess) {
        return db
            .insert(newAccess)
            .into("guest_conversation_access")
            .returning("*")
            .then(([createdAccess]) => createdAccess);
    },

    updateLastUsed(db, id) {
        return db
            .update({
                last_used_at: new Date()
            })
            .from("guest_conversation_access")
            .where({ id })
            .returning("*")
            .then(([updatedAccess]) => updatedAccess);
    },

    deleteAccessById(db, id) {
        return db
            .delete()
            .from("guest_conversation_access")
            .where({ id })
            .returning("*")
            .then(([deletedAccess]) => deletedAccess);
    }
};

module.exports = GuestConversationAccessService;