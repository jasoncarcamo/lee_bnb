require("dotenv").config();

module.exports = {
    "migrationDirectory": "migrations",
    "driver": "pg",
    "host": process.env.TEST_DB_HOST || "localhost",
    "port": process.env.TEST_DB_PORT || 5432,
    "database": process.env.TEST_DB_NAME || "lee_bnb",
    "username": process.env.TEST_DB_USER || "jason",
    "password": process.env.TEST_DB_PASS || "carcamo11",
};