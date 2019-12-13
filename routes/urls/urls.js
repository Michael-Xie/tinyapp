const { getCurrentDate, formatURL, urlsForUser, generateRandomString, filterUrlDB } = require("../../helpers");
const { urlDatabase, users } = require("../../starting-data");
const express = require('express');

const router = express.Router();

module.exports = () => {
  // GET /urls - Render the url collection page
  router.get("/", (req, res) => {
    if (!req.session.user_id) {
      res.status(401).send("ERROR 401: Unauthorized access. Please login.");
      return;
    } else {
      let filtered = filterUrlDB(urlsForUser(req.session.user_id, urlDatabase), urlDatabase);
      let templateVars = { urls: filtered, user: users[req.session.user_id] };
      res.render("urls_index", templateVars);
    }
  });

  // GET /urls/new - Render page to create new short url
  router.get("/new", (req, res) => {
    if (req.session.user_id) {
      let templateVars = { user: users[req.session.user_id] };
      res.render("urls_new", templateVars);
    } else {
      let templateVars = { user: users[req.session.user_id] };
      res.render("login", templateVars);
    }
  });

  // POST /urls - Create a new short url
  router.post("/", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = formatURL(req.body.longURL);
    urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id, dateCreated: getCurrentDate(), numVisit: 0, uniqueVisitor: [] };
    res.redirect(`/urls/${shortURL}`);
  });

  // GET /urls/:shortURL - Render a specified url page
  router.get("/:shortURL", (req, res) => {
    if (!req.session.user_id) {
      res.status(401).send("ERROR 401: Please log in to see page");
      return;
    }

    if (!(urlsForUser(req.session.user_id, urlDatabase).includes(req.params.shortURL))) {
      res.status(401).send(`ERROR 401: ${req.params.shortURL} doesn't belong to you.`);
      return;
    }

    if (urlDatabase[req.params.shortURL]) {
      let templateVars = { shortURL: req.params.shortURL, url: urlDatabase[req.params.shortURL], user: users[req.session.user_id] };
      res.render("urls_show", templateVars);
    } else {
      res.redirect("/new");
    }
  });

  // POST /urls/:shortURL - Update specified short url's long url
  router.post("/:shortURL", (req, res) => {
    if (req.session.user_id && urlsForUser(req.session.user_id, urlDatabase).includes(req.params.shortURL)) {
      urlDatabase[req.params.shortURL] = { longURL: formatURL(req.body.newLongURL), userID: req.session.user_id, dateCreated: getCurrentDate(), numVisit: 0, uniqueVisitor: [] };
    }
    res.redirect("/");
  });

  // POST /urls/:shortURL/delete - Remove a specified short url
  router.post("/:shortURL/delete", (req, res) => {
    if (req.session.user_id && urlsForUser(req.session.user_id, urlDatabase).includes(req.params.shortURL)) {
      delete urlDatabase[req.params.shortURL];
    }
    res.redirect("/");
  });

  return router;
};