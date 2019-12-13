const { hasVistorID, getCurrentDate, formatURL, urlsForUser, generateRandomString, getUserByEmail, filterUrlDB } = require("../../helpers");
const { urlDatabase, users } = require("../../starting-data");
const express = require('express');

const router = express.Router();

module.exports = () => {

  router.get("/", (req, res) => {
    console.log("GET /urls");
    if (!req.session.user_id) {
      res.status(401).send("ERROR 401: Unauthorized access. Please login.");
      return;
    } else {
      let filtered = filterUrlDB(urlsForUser(req.session.user_id, urlDatabase), urlDatabase);
      let templateVars = { urls: filtered, user: users[req.session.user_id] };
      res.render("urls_index", templateVars);
    }
  });

  // ADD new entry
  router.post("/", (req, res) => {
    console.log("POST /urls");
    let shortURL = generateRandomString();
    let longURL = formatURL(req.body.longURL);
    console.log(longURL);
    urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id, dateCreated: getCurrentDate(), numVisit: 0, uniqueVisitor: [] };
    res.redirect(`/urls/${shortURL}`);
  });

  router.get("/new", (req, res) => {
    console.log("GET /urls/new");
    if (req.session.user_id) {
      let templateVars = { user: users[req.session.user_id] };
      res.render("urls_new", templateVars);
    } else {
      let templateVars = { user: users[req.session.user_id] };
      res.render("login", templateVars)
    }
  });

  router.get("/:shortURL", (req, res) => {
    console.log("/urls/:shortURL");
    if (!req.session.user_id) {
      res.status(401).send("ERROR 401: Please log in to see page");
      return;
    }

    if (!(urlsForUser(req.session.user_id, urlDatabase).includes(req.params.shortURL))) {
      res.status(401).send(`ERROR 401: ${req.params.shortURL} doesn't belong to you.`)
      return;
    }

    if (urlDatabase[req.params.shortURL]) {
      let templateVars = { shortURL: req.params.shortURL, url: urlDatabase[req.params.shortURL], user: users[req.session.user_id] };
      res.render("urls_show", templateVars);
    } else {
      res.redirect("/new");
    }
  });

  // UPDATE :shortURL
  router.post("/:shortURL", (req, res) => {
    console.log("POST /urls/:shortURL");
    if (req.session.user_id && urlsForUser(req.session.user_id, urlDatabase).includes(req.params.shortURL)) {

      urlDatabase[req.params.shortURL] = { longURL: formatURL(req.body.newLongURL), userID: req.session.user_id, dateCreated: getCurrentDate(), numVisit: 0, uniqueVisitor: [] };
    }
    console.log("After Edit:", urlDatabase);
    res.redirect("/");
  })

  router.post("/:shortURL/delete", (req, res) => {
    console.log("POST /urls/:shortURL/delete");
    console.log("user_id: ", req.session.user_id);
    console.log("Urls for user:", urlsForUser(req.session.user_id, urlDatabase));
    console.log("shortURL:", req.params.shortURL)

    if (req.session.user_id && urlsForUser(req.session.user_id, urlDatabase).includes(req.params.shortURL)) {
      delete urlDatabase[req.params.shortURL];
    }
    console.log("After Delete: ", urlDatabase);

    res.redirect("/");
  })


  return router;
}