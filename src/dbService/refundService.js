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
    getRefundedTotalByPaymentId(db, payment_id) {

        return db("refunds")
            .where({ payment_id })
            .sum({
                total: "amount"
            })
            .first()
            .then(result => {

                return Number(
                    result?.total || 0
                );

            });
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