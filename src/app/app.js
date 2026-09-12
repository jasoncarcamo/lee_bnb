const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const {NODE_ENV} = require("../../config");
const registerRouter = require("../routes/registerRouter");
const loginRouter = require("../routes/loginRouter");

const propertyRouter = require("../routes/propertyRouter");
const propertyPhotoRouter = require("../routes/propertyPhotoRouter");

const AmenityRouter = require("../routes/amenityRouter");
const PropertyAmenityRouter = require("../routes/propertyAmenityRouter");

const propertyAvailabilityRouter = require("../routes/propertyAvailabilityRouter");
const propertyPricingRouter = require("../routes/propertyPricingRouter");

const guestRouter = require("../routes/guestRouter");
const reservationRouter = require("../routes/reservationsRouter");
const paymentRouter = require("../routes/paymentsRouter");
const refundRouter = require("../routes/refundRouter");

app.use(morgan("tiny"));
app.use(cors());
app.use(helmet());

app.use("/api", registerRouter);
app.use("/api", loginRouter);

app.use("/api/properties", propertyRouter);
app.use("/api/property-photos", propertyPhotoRouter);

app.use("/api/amenities", AmenityRouter);
app.use("/api/property-amenities", PropertyAmenityRouter);
app.use("/api/property-availability", propertyAvailabilityRouter);
app.use("/api/property-pricing", propertyPricingRouter);

app.use("/api/guests", guestRouter);
app.use("/api/reservations", reservationRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/refunds", refundRouter);

//Middleware error handler
app.use(function errorHandler(error, req, res, next) {

    let response;

    if (NODE_ENV === 'production') {
      response = { error: 'Server error' }
    } else {
      
      response = { error: error.message, object: error }
    };

    console.error(error);

    return res.status(500).json(response);
  });


app.get("/", (req, res)=> {
    res.send("Working");
});



module.exports = app;