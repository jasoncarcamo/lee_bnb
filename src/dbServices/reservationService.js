const ReservationService = {
    getAllReservations(db) {
        return db
            .select("*")
            .from("reservations")
            .orderBy("created_at", "desc");
    },

    getReservationById(db, id) {
        return db
            .select("*")
            .from("reservations")
            .where({ id })
            .first();
    },

    getReservationByConfirmationCode(db, confirmation_code) {
        return db
            .select("*")
            .from("reservations")
            .where({ confirmation_code })
            .first();
    },

    getReservationsByPropertyId(db, property_id) {
        return db
            .select("*")
            .from("reservations")
            .where({ property_id })
            .orderBy("check_in", "asc");
    },

    getReservationsByGuestId(db, guest_id) {
        return db
            .select("*")
            .from("reservations")
            .where({ guest_id })
            .orderBy("check_in", "desc");
    },

    getReservationsByStatus(db, status) {
        return db
            .select("*")
            .from("reservations")
            .where({ status })
            .orderBy("check_in", "asc");
    },

    getReservationsBetweenDates(db, property_id, check_in, check_out) {
        return db
            .select("*")
            .from("reservations")
            .where({ property_id })
            .whereIn("status", ["pending", "confirmed"])
            .where("check_in", "<", check_out)
            .where("check_out", ">", check_in);
    },

    createReservation(db, newReservation) {
        return db
            .insert(newReservation)
            .into("reservations")
            .returning("*")
            .then(([createdReservation]) => createdReservation);
    },

    updateReservationById(db, updatedReservation, id) {
        return db
            .update({
                ...updatedReservation,
                updated_at: new Date()
            })
            .from("reservations")
            .where({ id })
            .returning("*")
            .then(([updatedReservation]) => updatedReservation);
    },

    cancelReservationById(db, cancellation_reason, id) {
        return db
            .update({
                status: "cancelled",
                cancellation_reason,
                cancelled_at: new Date(),
                updated_at: new Date()
            })
            .from("reservations")
            .where({ id })
            .returning("*")
            .then(([cancelledReservation]) => cancelledReservation);
    }
};

module.exports = ReservationService;