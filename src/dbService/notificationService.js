const NotificationService = {
    getAllNotifications(db) {
        return db
            .select("*")
            .from("notifications")
            .orderBy("created_at", "desc");
    },

    getNotificationById(db, id) {
        return db
            .select("*")
            .from("notifications")
            .where({ id })
            .first();
    },

    getUnreadNotifications(db) {
        return db
            .select("*")
            .from("notifications")
            .where({ is_read: false })
            .orderBy("created_at", "desc");
    },

    getNotificationsByReservationId(db, reservation_id) {
        return db
            .select("*")
            .from("notifications")
            .where({ reservation_id })
            .orderBy("created_at", "desc");
    },

    getNotificationsByConversationId(db, conversation_id) {
        return db
            .select("*")
            .from("notifications")
            .where({ conversation_id })
            .orderBy("created_at", "desc");
    },

    createNotification(db, newNotification) {
        return db
            .insert(newNotification)
            .into("notifications")
            .returning("*")
            .then(([createdNotification]) => createdNotification);
    },

    markNotificationAsRead(db, id) {
        return db
            .update({ is_read: true })
            .from("notifications")
            .where({ id })
            .returning("*")
            .then(([updatedNotification]) => updatedNotification);
    },

    deleteNotificationById(db, id) {
        return db
            .delete()
            .from("notifications")
            .where({ id })
            .returning("*")
            .then(([deletedNotification]) => deletedNotification);
    }
};

module.exports = NotificationService;