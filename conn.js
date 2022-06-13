var mysql = require('mysql');
var conn = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Decosta@1234$juror$%"
});

conn.connect(function(err){
    if(err)
        throw err;
    console.log("Connection Success");

});

