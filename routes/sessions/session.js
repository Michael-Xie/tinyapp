const { generateRandomString, getUserByEmail } = require("../../helpers");
const { users } = require("../../starting-data");
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

module.exports = () => {
  router.get("/", (req, res) => {
    if (req.session.user_id) {
      res.redirect("/urls");
    } else {
      res.redirect("/login");
    }
  });
  
  router.get("/login", (req, res) => {
    console.log("GET /login");
    if (req.session.user_id) {
      console.log("logged in and redirecting to /urls");
      res.redirect("/urls");
      return;
    }
    let templateVars = { user: users[req.session.user_id] };
  
    console.log(users);
    res.render("login", templateVars);
  });

  router.post("/login", (req, res) => {
    console.log("GET /login");
    let user = getUserByEmail(req.body.email, users);
    if (!user) {
      res.status(403).send("ERROR 403: Email not found. Try again.");
      return;
    } else if (!bcrypt.compareSync(req.body.password, user.password)) {
      res.status(403).send("ERROR 403: Password doesn't match. Try Again.");
      return;
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  });
  
  router.get("/register", (req, res) => {
    console.log("GET /register");
    if (req.session.user_id) {
      console.log("logged in and redirecting to /urls");
      res.redirect("/urls");
      return;
    }
    let templateVars = { user: users[req.session.user_id] };
    res.render("registration", templateVars);
  });
  
  router.post("/register", (req, res) => {
    console.log("POST /register");
    let userID = generateRandomString();
    if (!req.body.email || !req.body.password) {
      res.status(400).send("ERROR 400: Please fill in both your email and password.");
      return;
    }
    if (getUserByEmail(req.body.email, users)) {
      res.status(400).send("ERROR 400: Email already exist.");
      return;
    }
    console.log("creating new user and redirecting to /urls");
    users[userID] = { id: userID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
    req.session.user_id = userID;
    res.redirect("/urls");
  });

  router.post("/logout", (req, res) => {
    console.log("POST /logout");
    req.session = null;
    res.redirect("/urls");
  });
  return router;
};
