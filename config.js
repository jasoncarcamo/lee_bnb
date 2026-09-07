require("dotenv").config();

module.exports = {
    PORT: process.env.TEST_PORT || 8000,
    DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://jason:carcamo11@localhost/leebnb',
    NODE_ENV: process.env.TEST_NODE_ENV || 'development',    
    JWT_SECRET: process.env.TEST_JWT_SECRET,
};