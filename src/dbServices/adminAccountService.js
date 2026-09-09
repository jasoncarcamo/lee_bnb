const AdminAccountService = {
    getAdminById(db, id) {
        return db
            .select("*")
            .from("admin_account")
            .where({ id })
            .first();
    },

    getAdminByEmail(db, email) {
        return db
            .select("*")
            .from("admin_account")
            .where({ email })
            .first();
    },

    createAdmin(db, newAdmin) {
        return db
            .insert(newAdmin)
            .into("admin_account")
            .returning("*")
            .then(([createdAdmin]) => createdAdmin);
    },

    updateAdminById(db, updatedAdmin, id) {
        return db
            .update({
                ...updatedAdmin,
                updated_at: new Date()
            })
            .from("admin_account")
            .where({ id })
            .returning("*")
            .then(([updatedAdmin]) => updatedAdmin);
    }
};

module.exports = AdminAccountService;