const TokenService = require("../securityServices/tokenService");
const AdminAccountService = require("../dbService/adminAccountService");


const AuthService = {

    getAdmin(db, email){

        return AdminAccountService.getAdminByEmail(
            db,
            email
        );

    },


    verifyToken(token){

        return TokenService.verifyToken(token);

    }

};


module.exports = AuthService;