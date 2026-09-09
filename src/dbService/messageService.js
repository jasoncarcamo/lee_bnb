const MessageService = {
    getMessagesByConversationId(db, conversation_id) {
        return db
            .select("*")
            .from("messages")
            .where({ conversation_id })
            .orderBy("created_at", "asc");
    },

    getMessageById(db, id) {
        return db
            .select("*")
            .from("messages")
            .where({ id })
            .first();
    },

    createMessage(db, newMessage) {
        return db
            .insert(newMessage)
            .into("messages")
            .returning("*")
            .then(([createdMessage]) => createdMessage);
    },

    markMessageAsRead(db, id) {
        return db
            .update({ is_read: true })
            .from("messages")
            .where({ id })
            .returning("*")
            .then(([updatedMessage]) => updatedMessage);
    },

    markConversationMessagesAsRead(db, conversation_id) {
        return db
            .update({ is_read: true })
            .from("messages")
            .where({
                conversation_id,
                is_read: false
            })
            .returning("*");
    },

    deleteMessageById(db, id) {
        return db
            .delete()
            .from("messages")
            .where({ id })
            .returning("*")
            .then(([deletedMessage]) => deletedMessage);
    }
};

module.exports = MessageService;