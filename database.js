var {Client} = require("pg")

var connection = new Client({
    host:"localhost",
    database:"dse",
    user:"root",
    password:"123456",
    multipleStatements: true
})
module.exports = connection