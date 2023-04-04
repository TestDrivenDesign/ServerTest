const express = require("express");
const cors = require("cors");
const multer = require("multer");
const FormData = require('form-data');
const fs = require('fs');
//Specific for URL paths
var path = require('path');
const {
  usersModel,
  fetchUsers,
  postUser,
  fetchUsersByEmail,
  fetchUserByUserId,
  insertImage,
  fetchDiagnoses,
  fetchAllDiagnoses
} = require("./models/usersModel");

const {readToBuffer} = require('./utils/fsreadutil');

const {postAssessment} = require('./models/assessment-model');
const app = express();
//const PORT = 3006;

// defines storage
const storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, './uploads/');
  },
  filename: function (req, file,  cb) {
    let timestamp = Date.now()  //Global variable!
    nameFile = timestamp + '-' + file.originalname 

    cb(null, nameFile)
  }
});
const upload = multer({storage: storage});

//Set URL for image hosting
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cors());

//get all endpoints !!!!!!
app.get("/", (req, res) => {
  res.json({ message: "endpoints" });
});


app.get("/users", (req, res) => {
  if (!req.body.email) {  
    res.status(400).send({ message: {error: "No email provided."}});

  } else {
    const { email } = req.body;
    const regex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$`);
    if (regex.test(email)) {
      fetchUsersByEmail(email).then((dbResponse) => {
        res.status(200).send({ message: dbResponse });
      });
    } else {
      res.status(400).send({ message: {error: `invalid email` }});
    }
  }
});

app.post("/users/login", upload.none(), (req, res) => {
  const { email, password } = req.body;

  //Regex seems to catch no "@" but misses no 
  const regex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?=[a-zA-Z]{2,}$)[a-zA-Z]{2,}$`);
  if (!req.body.email && !req.body.password) {        
    res.status(400).send({ message: {error: 'no email noptionaly password provided'}});
  } else  if (!req.body.password) {
    res.status(400).send({ message: {error: 'no password provided'}})
  } else if (!req.body.email){
    res.status(400).send({ message: {error: 'no email provided'}})
  }  
console.log('error')

  if (regex.test(email)){
    fetchUsersByEmail(email).then((dbResponse) => { 

      if (dbResponse[0] === undefined) {
        res.status(401).send({message: {error: 'Invalid credentials'}})
      } else if (password !== undefined && password !== dbResponse[0].password) {
        res.status(401).send({message: {error: 'Password does not match'}})
      }   
    });
  } 
});

app.post("/users/registration", upload.none(), (req, res) => {
  
  const {email, password, first_name, last_name} = req.body;

  if (!password) {
    res.status(400).send({ message: {error: 'No password provided'}})
  } else if (!email){
    res.status(400).send({ message: {error: 'No email provided'}})
  } else if (!first_name) {
    res.status(400).send({message: {error: 'No first_name provided'}})
  } else if (!last_name) {
    res.status(400).send({message: {error: 'No second_name provided'}})
  }

  fetchUsersByEmail(email).then((dbResponse) => {
    if (dbResponse[0]) {
      res.status(400).send({message: {error: 'An account is already registered with that email'}})
    } 
    let array = [[first_name, last_name, email, password]];
    return postUser('users', array)    
  })
   
      .then(()=>{return fetchUsersByEmail(email)})
      .then(dbResponse=>{
        res.status(201).send({ userData: dbResponse[0] })
      })   
})

app.post("/users/assessment", upload.single('file'), (req, res) => {
  const { file } = req
  const { user_id } = req.body
  const { date_of_birth } = req.body
  const file_name = nameFile
  const form = new FormData

  form.append('file', fs.createReadStream(req.file.path));  

  fetchUserByUserId(user_id).then((dbResponse) => {
    if (!dbResponse[0]) {
      res.status(400).send({message: {error: 'user does not exist'}})} 
    })
    .then(() => {
      return postAssessment(form)
    })
    .then((apiResponse) => {
        const diagnosis = apiResponse;
        const tableData = [[user_id, diagnosis, date_of_birth,  file_name]]    

        insertImage('subs', tableData)
      res.status(200).send({assessment: apiResponse.toString()})
    })
})

//Get all assesments
app.post("/users/diagnoses", upload.none(), (req, res) => {
 
  const { user_id } = req.body
  //grabs host URL name and ports
  const host = req.get('host')
 
  fetchDiagnoses(user_id)
  .then((dbResponse)=>{

    //Adds complete file path to output
    for(let a = 0; a < dbResponse.length; a++){
      dbResponse[a].file_name = 'http://' + host + '/' + dbResponse[a].file_name;
    }

    //console.log(dbResponse)
    res.status(200).send({diagnoses: dbResponse})
  }) 
})

//Get everyone's diagnoses
app.get('/subs', (req, res) => {
  fetchAllDiagnoses().then((dbResponse)=> {
    res.status(200).send({response: dbResponse})
  })
})

  //ERROR HANDLING
  //TDD
  
  //patch user details
  //delete submission
  //get all apis
  //implement password 
  //store images in databse

app.get("/data", (req, res) => {
  const host = req.get('host');
  res.status(200).send({data: {host: host}})

});

module.exports = app; 