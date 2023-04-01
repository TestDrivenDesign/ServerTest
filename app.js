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
  console.log(req);
  if (!req.body.email) {
    fetchUsers().then((dbResponse) => {
      console.log(dbResponse);
      res.status(200).send({ message: dbResponse });
    });
  } else {
    const { email } = req.body;
    const regex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$`);
    if (regex.test(email)) {
      fetchUsersByEmail(email).then((dbResponse) => {
        console.log(dbResponse);
        res.status(200).send({ message: dbResponse });
      });
    } else {
      res.status(400).send({ message: `invalid email` });
    }
  }
});

app.get("/users/:email", (req, res) => {
  console.log(req);
  const { email } = req.body;
  const regex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$`);
  if (regex.test(email)) {
    fetchUsersByEmail(email).then((dbResponse) => {
      console.log(dbResponse);
      res.status(200).send({ message: dbResponse });
    });
  } else {
    res.status(400).send({ message: `invalid email` });
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
  //console.log(email, password);
  fetchUsersByEmail(email).then((dbResponse) => {
    const { email, password } = dbResponse;
    console.log(dbResponse);
  });
});

app.listen(PORT, () => {
  console.log("Server Running on PORT", PORT);
});
