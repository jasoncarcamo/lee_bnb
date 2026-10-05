const TokenService = require("../securityService/TokenService");
const GuestService = require("../dbService/guestService");


const GuestAuthService = {

    getGuest(db, email){

        return GuestService.getGuestByEmail(
            db,
            email
        );

    },


    verifyToken(token){

        return TokenService.verifyToken(token);

    }

};


module.exports = GuestAuthService;