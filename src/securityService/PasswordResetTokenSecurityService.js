const crypto = require("crypto");


const PasswordResetTokenSecurityService = {
    createToken() {
        return crypto
            .randomBytes(32)
            .toString("hex");
    },
    hashToken(token) {
        return crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
    }

};


module.exports = PasswordResetTokenSecurityService;