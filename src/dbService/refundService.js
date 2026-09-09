const RefundService = {
    getRefundById(db, id) {
        return db
            .select("*")
            .from("refunds")
            .where({ id })
            .first();
    },

    getRefundsByPaymentId(db, payment_id) {
        return db
            .select("*")
            .from("refunds")
            .where({ payment_id })
            .orderBy("created_at", "desc");
    },

    createRefund(db, newRefund) {
        return db
            .insert(newRefund)
            .into("refunds")
            .returning("*")
            .then(([createdRefund]) => createdRefund);
    }
};

module.exports = RefundService;