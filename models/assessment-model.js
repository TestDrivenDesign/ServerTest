const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const modelApi = axios.create({
    baseURL: 'https://tdd-skin.herokuapp.com/',
  });
function postAssessment(file) {
    return new Promise ((resolve, reject) => {
        axios({
            method: "post",
            url: "https://tdd-skin.herokuapp.com/upload",
            data: file,
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then((res) => {
          //handle success
            console.log('RESPONSE!!!', res.data.type);
            return resolve(res.data.type)
          })
        
    })
}

module.exports = {postAssessment}