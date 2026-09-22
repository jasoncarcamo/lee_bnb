const nodemailer = require("nodemailer");

const config = require("../../config");

const InquiryEmailService = {

    async createTransport() {

        if (
            config.smtp.host &&
            config.smtp.user &&
            config.smtp.password
        ) {

            return {

                transporter: nodemailer.createTransport({

                    host: config.smtp.host,

                    port: config.smtp.port,

                    secure: config.smtp.secure,

                    auth: {

                        user: config.smtp.user,

                        pass: config.smtp.password

                    }

                }),

                isTest: false

            };

        }

        if (config.isProduction) {

            throw new Error(
                "SMTP configuration is required in production"
            );

        }

        const testAccount =
            await nodemailer.createTestAccount();

        return {

            transporter: nodemailer.createTransport({

                host: "smtp.ethereal.email",

                port: 587,

                secure: false,

                auth: {

                    user: testAccount.user,

                    pass: testAccount.pass

                }

            }),

            isTest: true

        };

    },

    async sendInquiryConfirmation(inquiry, token) {

        const { transporter, isTest } =
            await this.createTransport();

        const guestUrl = new URL(
            config.guestAppUrl
        );

        guestUrl.searchParams.set(
            "inquiry_token",
            token
        );

        const customerName = [
            inquiry.first_name,
            inquiry.last_name
        ]
            .filter(Boolean)
            .join(" ");

        const info = await transporter.sendMail({

            from:
                config.emailFrom ||
                '"Lee BnB" <no-reply@example.com>',

            to: inquiry.email,

            subject:
                "Please review your Lee BnB inquiry",

            text: [

                `Hello ${customerName},`,

                "",

                "Please review your Lee BnB inquiry.",

                "",

                "You can confirm or cancel the inquiry using this link:",

                guestUrl.toString(),

                "",

                "This link expires in 24 hours.",

                "",

                "Confirming an inquiry does not create a reservation.",

                "",

                "If you were not expecting this email, you can ignore it."

            ].join("\n")

        });

        if (isTest) {

            console.log(
                "Inquiry email test preview:",
                nodemailer.getTestMessageUrl(info)
            );

        }

        return info;

    }

};

module.exports = InquiryEmailService;