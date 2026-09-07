require("dotenv").config();
const app = require("./app");
const knex = require("knex");

const db = knex({
    client: "pg",
    connection: process.env.DATABASE_URL  || "postgresql://user:password@localhost/api-test"
});

app.set("db", db);

app.listen( process.env.PORT, ()=>{
    console.log("Working");
});