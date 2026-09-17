const PasswordResetService = {
    createPasswordResetToken(db, newPasswordResetToken) {
        return db
            .insert(newPasswordResetToken)
            .into("password_reset_tokens")
            .returning("*")
            .then(([createdPasswordResetToken]) =>
                createdPasswordResetToken
            );

    },
    getPasswordResetTokenByHash(db, token_hash) {
        return db
            .select("*")
            .from("password_reset_tokens")
            .where({ token_hash })
            .first();

    },
    deletePasswordResetTokensByAdminId(db, admin_id) {
        return db
            .delete()
            .from("password_reset_tokens")
            .where({ admin_id })
            .returning("*");

    },
    markPasswordResetTokenAsUsed(db, id) {
        return db
            .update({
                used_at: new Date()
            })
            .from("password_reset_tokens")
            .where({ id })
            .returning("*")
            .then(([updatedPasswordResetToken]) =>
                updatedPasswordResetToken
            );

    }

};


module.exports = PasswordResetService;