const pool = require("../connection");

function postUser(name, userData) {
  let data = [Object.values(userData)];

  // let data = [...userData].map(({ user_id, first_name, last_name, email, password }
  // ) => [user_id, first_name, last_name, email, password]);
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO ${name} (first_name, last_name, email, password) VALUES ?;`,
      [data],
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

async function usersModel(tableName, userData) {
  const seeder = await postUser(tableName, userData);
  // const shower = await showTable(name);

  return { seeder };
}

module.exports = { usersModel, fetchUsers, fetchUsersByEmail };
