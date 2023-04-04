const express = require("express");
const cors = require("cors");
const multer = require("multer");
const FormData = require('form-data');
const fs = require('fs');
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

const {postAssessment} = require('./models/assessment-model')
const app = express();
const PORT = 3000;

// defines storage
const storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, './uploads/');
  },
  filename: function (req, file,  cb) {
    let timestamp = Date.now()
    cb(null, timestamp + '-' + file.originalname )
  }
});

const upload = multer({storage: storage});

app.use(express.json());
app.use(cors());

//get all endpoints !!!!!!
app.get("/", (req, res) => {
  res.json({ message: "endpoints" });
});

app.get("/users", (req, res) => {
  if (!req.body.email) {  
    res.status(400).send({ message: {error: "No email provuded."}});
    /*fetchUsers().then((dbResponse) => {
      res.status(200).send({ message: dbResponse });
    });*/

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
    res.status(400).send({ message: {error: 'no email or password provided'}});
  } else  if (!req.body.password) {
    res.status(400).send({ message: {error: 'no password provided'}})
  } else if (!req.body.email){
    res.status(400).send({ message: {error: 'no email provided'}})
  }  
  if (regex.test(email)){
    fetchUsersByEmail(email).then((dbResponse) => {      

      if (password === dbResponse[0].password) {

        res.status(200).send({ userData: dbResponse[0] })
      } else {res.status(400).send({ message: {error: 'incorrect password'}})}      
    });
  } else {
    res.status(400).send({ message: {error: 'invalid email'}})
  } 
});

app.post("/users/registration", upload.none(), (req, res) => {
  const {email, password, first_name, last_name} = req.body;
  /*const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?=[a-zA-Z]{2,}$)[a-zA-Z]{2,}$/;
  const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;*/

  if (!password) {
    res.status(400).send({ message: {error: 'no password provided'}})
  } else if (!email){
    res.status(400).send({ message: {error: 'no email provided'}})
  } else if (!first_name) {
    res.status(400).send({message: 'no first_name provided'})
  } else if (!last_name) {
    res.status(400).send({message: 'no second_name provided'})
  }

    let array = [[first_name, last_name, email, password]];
    
   postUser('users', array)
      .then(()=>{return fetchUsersByEmail(email)})
      .then(dbResponse=>{

        
        res.status(201).send({ userData: dbResponse[0] })
      })   
  
})

app.post("/users/assessment", upload.single('file'), (req, res) => {
  const { file } = req
  const { user_id } = req.body
  const { date_of_birth } = req.body
  const file_name = req.file.originalname
  const form = new FormData

  form.append('file', fs.createReadStream(req.file.path));  

  fetchUserByUserId(user_id).then((dbResponse) => {
    if (!dbResponse[0]) {
      res.status(400).send({message: 'user does not exist'})
    } 
  }).then(() => {
    return postAssessment(form)
  })
    .then((apiResponse) => {
      const diagnosis = apiResponse;
      const tableData = [[user_id, diagnosis, date_of_birth, file_name]]
      
      insertImage('subs', tableData)

    res.status(200).send({assessment: apiResponse.toString()})
  })
  app.get("/users/image", (req, res) => {});
})

// app.post("/users/assessment", upload.single('file'), (req, res) => {
//   const { file } = req;
//   const { user_id } = req.body;
//   const file_name = req.file.originalname;
//   //const file_path = req.file.path;
//   const form = new FormData;

//   console.log(req)

//   form.append('file', fs.createReadStream(req.file.path));  

//   fetchUserByUserId(user_id)
//   .then((dbResponse) => {
//     if (!dbResponse[0]) {
//       res.status(400).send({message: 'user does not exist'})
//     } 
//     return postAssessment(form)
//   })
//     .then((apiResponse) => {

//       const diagnosis = apiResponse;
//       const tableData = [user_id, diagnosis, file_path]
      
//      return  insertImage('subs', tableData)
//     })
//     .then((response, fields)=>{
//       console.log(response, fields)
//       //res.status(201).send({apiResponse})
//   })
// })

app.get('/subs', (req, res) => {
  fetchAllDiagnoses().then((dbResponse)=> {
    console.log(dbResponse)
    res.status(200).send({response: dbResponse})
  })


})


//Get all assesments

app.post("/users/diagnoses", upload.none(), (req, res) => {
 
  const { user_id } = req.body
  console.log(user_id)
 
  fetchDiagnoses(user_id)
  .then((dbResponse)=>{
    console.log(dbResponse)
    res.status(200).send({diagnoses: dbResponse})
  })
  
  })

  //ERROR HANDLING
  //TDD

  
  //patch user details
  //delete submission
  //get all apis
  //implement password 
  //store images in databse



  app.get("/users/image", (req, res) => {});


app.listen(PORT, () => {
  console.log("Server Running on PORT", PORT);
});
