const TokenService = require("../securityService/TokenService");
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