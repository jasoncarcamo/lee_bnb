const PaymentService = {
    getAllPayments(db) {
        return db
            .select("*")
            .from("payments")
            .orderBy("created_at", "desc");
    },

    getPaymentById(db, id) {
        return db
            .select("*")
            .from("payments")
            .where({ id })
            .first();
    },

    getPaymentsByReservationId(db, reservation_id) {
        return db
            .select("*")
            .from("payments")
            .where({ reservation_id })
            .orderBy("created_at", "desc");
    },

    getPaymentByProviderPaymentId(db, provider_payment_id) {
        return db
            .select("*")
            .from("payments")
            .where({ provider_payment_id })
            .first();
    },

    createPayment(db, newPayment) {
        return db
            .insert(newPayment)
            .into("payments")
            .returning("*")
            .then(([createdPayment]) => createdPayment);
    },

    updatePaymentById(db, updatedPayment, id) {
        return db
            .update({
                ...updatedPayment,
                updated_at: new Date()
            })
            .from("payments")
            .where({ id })
            .returning("*")
            .then(([updatedPayment]) => updatedPayment);
    }
};

module.exports = PaymentService;