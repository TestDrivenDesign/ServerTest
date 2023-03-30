const mysql = require('mysql2');

//Returns npm NODE_ENV variable
let environment = process.env.NODE_ENV || 'development';

//Changes global Node variables
require('dotenv').config({ path: `${__dirname}/.env.${environment}`, });

const config =
  true
    ? {
      host: process.env.HOST,
      user: process.env.DB_USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      waitForConnections: true,
      multipleStatements: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0
      //   database: Specific database can be selected!
    }
    : {};

//console.log(config, environment)

//Exports connectable pool

module.exports = new mysql.createPool(config);