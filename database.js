var {Client} = require("pg")

var connection = new Client({
    host:process.env.DB_HOST ,
    database:process.env.DB_DATABASE ,
    user:process.env.DB_USER ,
    password:process.env.DB_PASSWORD ,
    multipleStatements:process.env.DB_MULTIPLESTATEMENTS
})
module.exports = connection

