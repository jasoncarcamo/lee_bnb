require("dotenv").config();

module.exports = {
    PORT: process.env.PORT || 8000,
    DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://jason:carcamo11@localhost/lee_bnb',
    NODE_ENV: process.env.NODE_ENV || 'development',    
    JWT_SECRET: process.env.TEST_JWT_SECRET,
};