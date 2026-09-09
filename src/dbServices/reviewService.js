const ReviewService = {
    getAllReviews(db) {
        return db
            .select("*")
            .from("reviews")
            .orderBy("created_at", "desc");
    },

    getReviewById(db, id) {
        return db
            .select("*")
            .from("reviews")
            .where({ id })
            .first();
    },

    getReviewsByPropertyId(db, property_id) {
        return db
            .select("*")
            .from("reviews")
            .where({
                property_id,
                is_published: true
            })
            .orderBy("created_at", "desc");
    },

    getReviewsByGuestId(db, guest_id) {
        return db
            .select("*")
            .from("reviews")
            .where({ guest_id })
            .orderBy("created_at", "desc");
    },

    createReview(db, newReview) {
        return db
            .insert(newReview)
            .into("reviews")
            .returning("*")
            .then(([createdReview]) => createdReview);
    },

    updateReviewById(db, updatedReview, id) {
        return db
            .update({
                ...updatedReview,
                updated_at: new Date()
            })
            .from("reviews")
            .where({ id })
            .returning("*")
            .then(([updatedReview]) => updatedReview);
    },

    deleteReviewById(db, id) {
        return db
            .delete()
            .from("reviews")
            .where({ id })
            .returning("*")
            .then(([deletedReview]) => deletedReview);
    }
};

module.exports = ReviewService;