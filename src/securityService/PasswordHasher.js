const bcrypt = require("bcryptjs");

const Passwordhasher = {
    hashPassword(password){
        return bcrypt.hash(password, 12);
    },
    comparePassword(password, hashedPassword){
        return bcrypt.compare(password, hashedPassword);
    }
};

module.exports = Passwordhasher;