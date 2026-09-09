const GuestService = {
    getAllGuests(db) {
        return db
            .select("*")
            .from("guests");
    },

    getGuestById(db, id) {
        return db
            .select("*")
            .from("guests")
            .where({ id })
            .first();
    },

    getGuestByEmail(db, email) {
        return db
            .select("*")
            .from("guests")
            .where({ email })
            .first();
    },

    createGuest(db, newGuest) {
        return db
            .insert(newGuest)
            .into("guests")
            .returning("*")
            .then(([createdGuest]) => createdGuest);
    },

    updateGuestById(db, updatedGuest, id) {
        return db
            .update({
                ...updatedGuest,
                updated_at: new Date()
            })
            .from("guests")
            .where({ id })
            .returning("*")
            .then(([updatedGuest]) => updatedGuest);
    },

    deleteGuestById(db, id) {
        return db
            .delete()
            .from("guests")
            .where({ id })
            .returning("*")
            .then(([deletedGuest]) => deletedGuest);
    }
};

module.exports = GuestService;