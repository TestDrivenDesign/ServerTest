const express = require("express");
const cors = require('cors');

const usersModel = require("./models/usersModel");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "I'm sorry, Alex, I'm afraid I can't do that." });
});

app.get("/health-check", (req, res) => {
  res.json({ message: "HAL up and running" });
});

app.post("/users", (req, res) => {
  newUser = req.body;
  usersModel('users', newUser).then((dbResponse) => {
    res.status(201).send(dbResponse);
  });
});

app.listen(PORT, () => {
  console.log("Server Running on PORT", PORT);
});