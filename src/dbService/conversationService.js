const ConversationService = {
    getAllConversations(db) {
        return db
            .select("*")
            .from("conversations")
            .orderBy("last_message_at", "desc");
    },

    getConversationById(db, id) {
        return db
            .select("*")
            .from("conversations")
            .where({ id })
            .first();
    },

    getConversationsByGuestId(db, guest_id) {
        return db
            .select("*")
            .from("conversations")
            .where({ guest_id })
            .orderBy("last_message_at", "desc");
    },

    getConversationsByReservationId(db, reservation_id) {
        return db
            .select("*")
            .from("conversations")
            .where({ reservation_id })
            .orderBy("created_at", "desc");
    },

    createConversation(db, newConversation) {
        return db
            .insert(newConversation)
            .into("conversations")
            .returning("*")
            .then(([createdConversation]) => createdConversation);
    },

    updateConversationById(db, updatedConversation, id) {
        return db
            .update({
                ...updatedConversation,
                updated_at: new Date()
            })
            .from("conversations")
            .where({ id })
            .returning("*")
            .then(([updatedConversation]) => updatedConversation);
    }
};

module.exports = ConversationService;