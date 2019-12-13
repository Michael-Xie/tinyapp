const { hasVistorID, generateRandomString } = require("../../helpers");
const { urlDatabase } = require("../../starting-data");
const express = require('express');

const router = express.Router();

module.exports = () => {
  // Track unique visitors that visit the specified shortened url by using a vistior_id cookie
  router.use("/:shortURL", (req, res, next) => {
    if (!req.session.visitor_id) {
      req.session.visitor_id = generateRandomString();
    }
    if (!hasVistorID(req.params.shortURL, req.session.visitor_id, urlDatabase)) {
      urlDatabase[req.params.shortURL].uniqueVisitor.push(req.session.visitor_id);
    }
    if (urlDatabase[req.params.shortURL]) {
      urlDatabase[req.params.shortURL].numVisit++;
    }
    next();
  });

  // GET /u/:shortURL - Redirect valid short url to its long url
  router.get("/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (urlDatabase[req.params.shortURL]) {
      res.redirect(longURL);
    } else {
      res.redirect("/urls/new");
    }
  });
    
  return router;
};
