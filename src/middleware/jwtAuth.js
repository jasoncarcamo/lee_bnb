const AuthService = require("./AuthService");


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


module.exports = {
    requireAuth
};