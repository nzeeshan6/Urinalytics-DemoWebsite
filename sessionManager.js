const sql = require('mysql')

const connection = sql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'uri_sessions',
    multipleStatements: false
})


module.exports = connection;
