const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: process.env.MARIADBHOST,
    port: process.env.MARIADBPORT,
    user: process.env.MARIADBUSER,
    password: process.env.MARIADBPASSWORD,
    database: process.env.MARIADB

});

module.exports = pool;