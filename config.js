require("dotenv").config();

module.exports = {
    PORT: process.env.TEST_PORT || 8000,
    DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://jason:carcamo11@localhost/leebnb',
    NODE_ENV: process.env.TEST_NODE_ENV || 'development',    
    JWT_SECRET: process.env.TEST_JWT_SECRET,
    smtp: {
        host: process.env.SMTP_HOST,
        port: Number(
            process.env.SMTP_PORT || 587
    ),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD
    },
    emailFrom: process.env.EMAIL_FROM,
    guestAppUrl:
        process.env.GUEST_APP_URL ||
        "http://localhost:3000/guest",
    isProduction:
        process.env.NODE_ENV === "production"
};