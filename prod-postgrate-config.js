require("dotenv").config();
module.exports = {
  "migrationDirectory": "migrations",
  "driver": "pg",
  "host": process.env.PROD_DB_HOST,
  "port": process.env.PROD_DB_PORT,
  "database": process.env.PROD_DB_NAME,
  "username": process.env.PROD_DB_USER,
  "password": process.env.PROD_DB_PASS,
  "ssl": { 
      rejectUnauthorized: false 
  } 
};