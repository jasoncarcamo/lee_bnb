const PropertyService = require("./propertyService");
const GuestService = require("./guestService");
const PropertyAvailabilityService = require("./propertyAvailabilityService");
const PropertyPricingService = require("./propertyPricingService");

const ReservationService = {
    validateProperty(db, property_id) {

    return PropertyService.getPropertyById(
            db,
            property_id
        )
            .then(property => {

                if(!property){

                    return {
                        valid: false,
                        error: "Property not found"
                    };

                };


                if(property.status !== "active"){

                    return {
                        valid: false,
                        error: "Property is not active"
                    };

                };


                return {
                    valid: true,
                    property
                };

            });

    },
    validateGuest(db, guest_id) {

        return GuestService.getGuestById(
            db,
            guest_id
        )
            .then(guest => {

                if(!guest){

                    return {
                        valid: false,
                        error: "Guest not found"
                    };

                };


                return {
                    valid: true,
                    guest
                };

            });

    },
    validateDates(check_in, check_out) {

        if(!check_in){

            return {
                valid: false,
                error: "Missing check_in"
            };

        };


        if(!check_out){

            return {
                valid: false,
                error: "Missing check_out"
            };

        };


        const checkInDate = new Date(
            `${check_in}T00:00:00`
        );

        const checkOutDate = new Date(
            `${check_out}T00:00:00`
        );


        if(
            Number.isNaN(checkInDate.getTime()) ||
            Number.isNaN(checkOutDate.getTime())
        ){

            return {
                valid: false,
                error: "Invalid reservation dates"
            };

        };


        if(checkOutDate <= checkInDate){

            return {
                valid: false,
                error: "check_out must be after check_in"
            };

        };


        const millisecondsPerDay =
            1000 * 60 * 60 * 24;


        const nights = Math.round(
            (checkOutDate - checkInDate) /
            millisecondsPerDay
        );


        return {
            valid: true,
            nights
        };

    },
    validateGuestCount(guests_count, property) {

        if(
            guests_count === undefined ||
            guests_count === null
        ){

            return {
                valid: false,
                error: "Missing guests_count"
            };

        };


        if(guests_count <= 0){

            return {
                valid: false,
                error: "guests_count must be greater than 0"
            };

        };


        if(guests_count > property.max_guests){

            return {
                valid: false,
                error:
                    `Maximum guests allowed is ${property.max_guests}`
            };

        };


        return {
            valid: true
        };

    },
    checkExistingReservations(
        db,
        property_id,
        check_in,
        check_out
    ) {

        return ReservationService
            .getReservationsBetweenDates(
                db,
                property_id,
                check_in,
                check_out
            )
            .then(reservations => {

                if(reservations.length > 0){

                    return {
                        valid: false,
                        error:
                            "Property is already reserved for these dates",
                        reservations
                    };

                };


                return {
                    valid: true,
                    reservations: []
                };

            });

    },
    checkAvailability(
        db,
        property_id,
        check_in,
        check_out
    ) {

        return PropertyAvailabilityService
            .getAvailabilityBetweenDates(
                db,
                property_id,
                check_in,
                check_out
            )
            .then(availability => {

                const unavailableDates =
                    availability.filter(
                        day =>
                            day.is_available === false
                    );


                if(unavailableDates.length > 0){

                    return {
                        valid: false,
                        error:
                            "Property is unavailable for one or more requested dates",
                        unavailableDates
                    };

                };


                return {
                    valid: true,
                    availability
                };

            });

    },
    calculateReservationPricing(
        db,
        reservationData
    ) {

        const {
            property_id,
            check_in,
            check_out,
            property
        } = reservationData;


        const startDate = new Date(
            `${check_in}T00:00:00`
        );

        const endDate = new Date(
            `${check_out}T00:00:00`
        );


        let currentDate = new Date(startDate);

        let nightlySubtotal = 0;

        let nights = 0;

        const nightlyPrices = [];


        const getNextNight = () => {

            if(currentDate >= endDate){

                return Promise.resolve({

                    nights,

                    nightly_subtotal:
                        Number(
                            nightlySubtotal.toFixed(2)
                        ),

                    nightly_prices:
                        nightlyPrices

                });

            };


            const date = currentDate
                .toISOString()
                .split("T")[0];


            return PropertyPricingService
                .getPricingForDate(
                    db,
                    property_id,
                    date
                )
                .then(pricing => {

                    let nightlyPrice;


                    if(pricing){

                        nightlyPrice =
                            Number(pricing.nightly_price);

                    } else {

                        nightlyPrice =
                            Number(property.base_price);

                    };


                    nightlySubtotal += nightlyPrice;

                    nights++;


                    nightlyPrices.push({

                        date,

                        nightly_price:
                            nightlyPrice,

                        pricing_source:
                            pricing
                                ? "custom"
                                : "base"

                    });


                    currentDate.setDate(
                        currentDate.getDate() + 1
                    );


                    return getNextNight();

                });

        };


        return getNextNight();

    },
    calculateReservationTotal(
        property,
        pricing
    ) {

        const cleaningFee =
            Number(property.cleaning_fee || 0);


        const serviceFee =
            Number(
                (
                    pricing.nightly_subtotal *
                    0.10
                ).toFixed(2)
            );


        const taxes =
            Number(
                (
                    (
                        pricing.nightly_subtotal +
                        cleaningFee +
                        serviceFee
                    ) *
                    0.08
                ).toFixed(2)
            );


        const discount = 0;


        const totalPrice =
            Number(
                (
                    pricing.nightly_subtotal +
                    cleaningFee +
                    serviceFee +
                    taxes -
                    discount
                ).toFixed(2)
            );


        return {

            nightly_subtotal:
                pricing.nightly_subtotal,

            cleaning_fee:
                cleaningFee,

            service_fee:
                serviceFee,

            taxes,

            discount,

            total_price:
                totalPrice

        };

    }
};

module.exports = ReservationService;