const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer();

const {
  usersModel,
  fetchUsers,
  fetchUsersByEmail,
} = require("./models/usersModel");

const app = express();
const PORT = 3001;

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
        res.status(200).send({ message: 'password verified'})
      } else {
        res.status(400).send({ message: 'incorrect password'})
      }      
    });
  } else {
    res.status(400).send({ message: 'invalid email'})
  } 
});

app.listen(PORT, () => {
  console.log("Server Running on PORT", PORT);
});
