const PasswordResetTokenService = {
    getTokenByHash(db, token_hash) {
        return db
            .select("*")
            .from("admin_password_reset_tokens")
            .where({ token_hash })
            .first();
    },

    getTokensByAdminId(db, admin_id) {
        return db
            .select("*")
            .from("admin_password_reset_tokens")
            .where({ admin_id })
            .orderBy("created_at", "desc");
    },

    createPasswordResetToken(db, newToken) {
        return db
            .insert(newToken)
            .into("admin_password_reset_tokens")
            .returning("*")
            .then(([createdToken]) => createdToken);
    },

    markTokenAsUsed(db, id) {
        return db
            .update({
                used_at: new Date()
            })
            .from("admin_password_reset_tokens")
            .where({ id })
            .returning("*")
            .then(([usedToken]) => usedToken);
    },

    deleteTokenById(db, id) {
        return db
            .delete()
            .from("admin_password_reset_tokens")
            .where({ id })
            .returning("*")
            .then(([deletedToken]) => deletedToken);
    },

    deleteExpiredTokens(db) {
        return db
            .delete()
            .from("admin_password_reset_tokens")
            .where("expires_at", "<", new Date())
            .returning("*");
    }
};

module.exports = PasswordResetTokenService;