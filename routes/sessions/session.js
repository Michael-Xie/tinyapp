const { generateRandomString, getUserByEmail } = require("../../helpers");
const { users } = require("../../starting-data");
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

module.exports = () => {
  // GET / - Redirect from home based on login status
  router.get("/", (req, res) => {
    if (req.session.user_id) {
      res.redirect("/urls");
    } else {
      res.redirect("/login");
    }
  });
  
  // GET /login - Render login page
  router.get("/login", (req, res) => {
    if (req.session.user_id) {
      res.redirect("/urls");
      return;
    }
    let templateVars = { user: users[req.session.user_id] };
    res.render("login", templateVars);
  });

  // POST /login - Log-in into valid account
  router.post("/login", (req, res) => {
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
  
  // GET /register - Render register page
  router.get("/register", (req, res) => {
    if (req.session.user_id) {
      res.redirect("/urls");
      return;
    }
    let templateVars = { user: users[req.session.user_id] };
    res.render("registration", templateVars);
  });
  
  // POST /register - Create a new user
  router.post("/register", (req, res) => {
    let userID = generateRandomString();
    if (!req.body.email || !req.body.password) {
      res.status(400).send("ERROR 400: Please fill in both your email and password.");
      return;
    }
    if (getUserByEmail(req.body.email, users)) {
      res.status(400).send("ERROR 400: Email already exist.");
      return;
    }
    users[userID] = { id: userID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
    req.session.user_id = userID;
    res.redirect("/urls");
  });

  // POST /logout - Log user out by removing encrypted cookie
  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
  });
  return router;
};
