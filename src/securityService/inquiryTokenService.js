const crypto = require("crypto");

const TOKEN_EXPIRATION_HOURS = 24;

const InquiryTokenService = {

    generateToken() {

        return crypto
            .randomBytes(32)
            .toString("hex");

    },

    hashToken(token) {

        return crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

    },

    getExpirationDate() {

        const expirationDate = new Date();

        expirationDate.setHours(
            expirationDate.getHours() +
            TOKEN_EXPIRATION_HOURS
        );

        return expirationDate;

    },

    isTokenExpired(expires_at) {

        const expirationDate = new Date(expires_at);

        return (
            Number.isNaN(expirationDate.getTime()) ||
            expirationDate.getTime() <= Date.now()
        );

    },

    isTokenUsed(used_at) {

        return used_at !== null &&
            used_at !== undefined;

    }

};

module.exports = InquiryTokenService;