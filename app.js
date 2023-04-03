const express = require("express");
const cors = require("cors");
const multer = require("multer");
const FormData = require('form-data');
const fs = require('fs');
const {
  usersModel,
  fetchUsers,
  fetchUsersByEmail,
  fetchUserByUserId,
  insertImage
} = require("./models/usersModel");

const {readToBuffer} = require('./utils/fsreadutil');

const {postAssessment} = require('./models/assessment-model')
const app = express();
const PORT = 3001;

// defines storage
const storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, './uploads/');
  },
  filename: function (req, file,  cb) {
    cb(null, file.originalname )
  }
});
const upload = multer({storage: storage});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "I'm sorry, Alex, I'm afraid I can't do that." });
});

app.get("/users", (req, res) => {
  if (!req.body.email) {    
    fetchUsers().then((dbResponse) => {
      res.status(200).send({ message: dbResponse });
    });
  } else {
    const { email } = req.body;
    const regex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$`);
    if (regex.test(email)) {
      fetchUsersByEmail(email).then((dbResponse) => {
        res.status(200).send({ message: dbResponse });
      });
    } else {
      res.status(400).send({ message: `invalid email` });
    }
  }
});



app.get("/health-check", (req, res) => {
  console.log(req);
  fetchHealthCheck().then((dbResponse) => {});
  res.json({ message: "HAL up and running" });
});

app.get("/users/image", (req, res) => {});

app.post("/users/login", upload.none(), (req, res) => {
  const { email, password } = req.body;
  // regex seems to catch no "@" but misses no .
  const regex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?=[a-zA-Z]{2,}$)[a-zA-Z]{2,}$`);
  if (!req.body.email && !req.body.password) {        
    res.status(400).send({ message: 'no email or password provided'});
  } else  if (!req.body.password) {
    res.status(400).send({ message: 'no password provided'})
  } else if (!req.body.email){
    res.status(400).send({ message: 'no email provided'})
  }  
  if (regex.test(email)){
    fetchUsersByEmail(email).then((dbResponse) => {      
      console.log('db response at app', dbResponse[0].password);
      if (password === dbResponse[0].password) {
        res.status(200).send(dbResponse[0])
      } else {
        res.status(400).send({ message: 'incorrect password'})
      }      
    });
  } else {
    res.status(400).send({ message: 'invalid email'})
  } 
});

app.post("/users/registration", upload.none(), (req, res) => {
  const {email, password, username, first_name, second_name} = req.body;
  const regex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?=[a-zA-Z]{2,}$)[a-zA-Z]{2,}$`)
  if (!req.body.password) {
    res.status(400).send({ message: 'no password provided'})
  } else if (!req.body.email){
    res.status(400).send({ message: 'no email provided'})
  } else if (!req.body.first_name) {
    res.status(400).send({message: 'no first_name provided'})
  } else if (!req.body.secondd_name) {
    res.status(400).send({message: 'no second_name provided'})
  } else if (!req.body.username) {
    res.status(400).send({message: 'no username provided'})
  }
  if (regex.test(email)) {
    postUser({ first_name: first_name, second_name: second_name, email: email, password: password})
  }


})
app.post("/users/assessment", upload.single('file'), (req, res) => {
  const { file } = req
  const { user_id } = req.body
  const file_name = req.file.originalname
  const form = new FormData
  form.append('file', fs.createReadStream(req.file.path));  

  console.log(user_id)
  fetchUserByUserId(user_id).then((dbResponse) => {
    if (!dbResponse[0]) {
      res.status(400).send({message: 'user does not exist'})
    } 
  }).then(() => {
    return postAssessment(form)
  })
    .then((apiResponse) => {
      
      const diagnosis = apiResponse;
      const tableData = [user_id, diagnosis, file_name, file]
      insertImage('subs', tableData)

    console.log(apiResponse)
    res.status(200).send(apiResponse.toString())
  })
  
})
app.listen(PORT, () => {
  console.log("Server Running on PORT", PORT);
});
