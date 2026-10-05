const AuthService = require("./AuthService");
const GuestAuthService = require("./GuestAuthService");

function requireAuth(req, res, next){

    const authToken = req.get("authorization") || "";

    let bearerToken;


    if(!authToken.toLowerCase().startsWith("bearer ")){

        return res.status(401).json({
            error: "Missing bearer token"
        });

    } else {

        bearerToken = authToken.slice(7, authToken.length);

    };


    try{

        const payload = AuthService.verifyToken(bearerToken);


        /*
            ADMIN TOKENS ONLY
        */
        if(payload.type !== "admin"){

            return res.status(401).json({
                error: "Unauthorized request"
            });

        };


        AuthService.getAdmin(
            req.app.get("db"),
            payload.sub
        )
            .then(admin => {

                if(!admin){

                    return res.status(401).json({
                        error: "Unauthorized request"
                    });

                };


                req.admin = admin;

                next();

            })
            .catch(error => {

                next(error);

            });


    } catch(error){

        return res.status(401).json({
            error: "Unauthorized request"
        });

    };

};


function requireGuestAuth(req, res, next){

    const authToken = req.get("authorization") || "";

    let bearerToken;


    if(!authToken.toLowerCase().startsWith("bearer ")){

        return res.status(401).json({
            error: "Missing bearer token"
        });

    } else {

        bearerToken = authToken.slice(7, authToken.length);

    };


    try{

        const payload =
            GuestAuthService.verifyToken(
                bearerToken
            );


        /*
            GUEST TOKENS ONLY
        */
        if(payload.type !== "guest"){

            return res.status(401).json({
                error: "Unauthorized request"
            });

        };


        GuestAuthService.getGuest(
            req.app.get("db"),
            payload.sub
        )
            .then(guest => {

                if(!guest){

                    return res.status(401).json({
                        error: "Unauthorized request"
                    });

                };


                delete guest.password_hash;


                req.guest = guest;

                next();

            })
            .catch(error => {

                next(error);

            });


    } catch(error){

        return res.status(401).json({
            error: "Unauthorized request"
        });

    };

};

module.exports = {
    requireAuth,
    requireGuestAuth
};