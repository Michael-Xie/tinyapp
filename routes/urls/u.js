const { hasVistorID, generateRandomString } = require("../../helpers");
const { urlDatabase } = require("../../starting-data");
const express = require('express');

const router = express.Router();

module.exports = () => {
  router.use("/:shortURL", (req, res, next) => {
    if (!req.session.visitor_id) {
      req.session.visitor_id = generateRandomString();
    }
    console.log("Visitor_id:", req.session.visitor_id);

    if (!hasVistorID(req.params.shortURL, req.session.visitor_id, urlDatabase)) {
      urlDatabase[req.params.shortURL].uniqueVisitor.push(req.session.visitor_id);
      console.log(urlDatabase);
    }
    if (urlDatabase[req.params.shortURL]) {
      urlDatabase[req.params.shortURL].numVisit++;
    }
    next();
  });
  router.get("/:shortURL", (req, res) => {
    console.log("/u/:shortURL");
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (urlDatabase[req.params.shortURL]) {
      res.redirect(longURL);
    } else {
      res.redirect("/urls/new");
    }
  });
    
  return router;
};
