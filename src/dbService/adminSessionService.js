const AdminSessionService = {
    getSessionById(db, id) {
        return db
            .select("*")
            .from("admin_sessions")
            .where({ id })
            .first();
    },

    getSessionByTokenHash(db, session_token_hash) {
        return db
            .select("*")
            .from("admin_sessions")
            .where({ session_token_hash })
            .first();
    },

    getSessionsByAdminId(db, admin_id) {
        return db
            .select("*")
            .from("admin_sessions")
            .where({ admin_id })
            .orderBy("created_at", "desc");
    },

    createSession(db, newSession) {
        return db
            .insert(newSession)
            .into("admin_sessions")
            .returning("*")
            .then(([createdSession]) => createdSession);
    },

    deleteSessionById(db, id) {
        return db
            .delete()
            .from("admin_sessions")
            .where({ id })
            .returning("*")
            .then(([deletedSession]) => deletedSession);
    },

    deleteExpiredSessions(db) {
        return db
            .delete()
            .from("admin_sessions")
            .where("expires_at", "<", new Date())
            .returning("*");
    },

    deleteSessionsByAdminId(db, admin_id) {
        return db
            .delete()
            .from("admin_sessions")
            .where({ admin_id })
            .returning("*");
    }
};

module.exports = AdminSessionService;