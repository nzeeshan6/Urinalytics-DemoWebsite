const { json } = require('body-parser');
var mysql = require('mysql');
var conn = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    connectionLimit: 100,
    multipleStatements: false
});

module.exports = conn;



