const pool = require("../connection");

function postUser(name, userData) { 

  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO ${name} (first_name, last_name, email, password) VALUES ?;`,
      [userData],
      (error, response, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(response, fields);
      }
    );
  });
}

function fetchUsers() {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM users;`, (error, response, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(response, fields);
    });
  });
}

function fetchUsersByEmail(email) {


  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * FROM users WHERE users.email = ?;`,
      [email],
      (error, response, fields) => {
        if (error) {          
          return reject(error);
        }     
   
        return resolve(response, fields);
      }
    );
  });
}

function fetchUserByUserId(userId) {
  
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * FROM users WHERE users.user_id = ?;`,
      [userId],
      (error, response, fields) => {
        if (error) {          
          return reject(error);
        }        
        return resolve(response, fields);
      }
    );
  });
}

function insertImage(tableName, rowData) {
  
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO ${tableName} (user_id, diagnosis, date_of_birth, file_name) VALUES ?;`, [rowData],
      (error, response, fields) => {
        if (error) { return reject(error);}
        return resolve(response, fields);
      });
  });
}

function fetchDiagnoses( user_id ){
  return new Promise((resolve, reject)=>{
      pool.query(`SELECT * FROM subs WHERE user_id = ?;`, [user_id], (error, response, fields)=>{
          if (error) { return reject(error); }
          return resolve(response, fields)
      })
  })
}

function fetchAllDiagnoses() {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM subs ;', (error, response, fields) => {
      if (error) { return reject(error)}
      return resolve(response, fields)
    })
  })
}
//function fetchUserByEmailPassword(email, password) {}

// function showTable(name) {

//   return new Promise((resolve, reject) => {
//     pool.query(
//       `SELECT * FROM ${name};`,
//       (error, response, fields) => {
//         if (error) { return reject(error); }
//         return resolve(response, fields);
//       });
//   });
// }



module.exports = { postUser, fetchUsers, fetchUsersByEmail, fetchUserByUserId, insertImage, fetchDiagnoses, fetchAllDiagnoses};
