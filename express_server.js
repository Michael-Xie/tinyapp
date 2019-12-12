const { urlsForUser, generateRandomString, getUserByEmail, filterUrlDB } = require("./helpers");
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

const getCurrentDate = function () {
  let date = new Date();
  return date.toDateString();
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW", dateCreated: getCurrentDate(), numVisit: 0, uniqueVisitor: [] },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID", dateCreated: getCurrentDate(), numVisit: 0, uniqueVisitor: [] }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "$2b$10$qgxfbasQ.RFYhuKgvPh7rOBR5JLxAgVQz5cti1cwZMc3TSBoObk/m"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$qgxfbasQ.RFYhuKgvPh7rOBR5JLxAgVQz5cti1cwZMc3TSBoObk/m"
  }
}

const hasVistorID = function (url_id, visitor_id, urlDatabase) {
  console.log(urlDatabase[url_id].uniqueVisitor);
  console.log(visitor_id);
  console.log(urlDatabase[url_id].uniqueVisitor.includes(visitor_id));
  return urlDatabase[url_id].uniqueVisitor.includes(visitor_id);
}

app.use("/u/:shortURL", (req, res, next) => {
  if (!req.session.visitor_id) {
    req.session.visitor_id = generateRandomString();
  }

  if (!hasVistorID(req.params.shortURL, req.session.visitor_id, urlDatabase)) {
    urlDatabase[req.params.shortURL].uniqueVisitor.push(req.session.visitor_id);
    console.log(urlDatabase);
  }
  if (urlDatabase[req.params.shortURL]) {
    urlDatabase[req.params.shortURL].numVisit++;
  }
  next();
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/login", (req, res) => {
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

app.post("/logout", (req, res) => {
  console.log("POST /logout");
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  console.log("GET /register");
  if (req.session.user_id) {
    console.log("logged in and redirecting to /urls");
    res.redirect("/urls");
    return;
  }
  let templateVars = { user: users[req.session.user_id] };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
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
})

app.get("/login", (req, res) => {
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

app.get("/urls", (req, res) => {
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

app.get("/urls/new", (req, res) => {
  console.log("GET /urls/new");
  if (req.session.user_id) {
    let templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    let templateVars = { user: users[req.session.user_id] };
    res.render("login", templateVars)
  }
});

// ADD new entry
app.post("/urls", (req, res) => {
  console.log("POST /urls");
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  console.log(longURL);
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id, dateCreated: getCurrentDate(), numVisit: 0, uniqueVisitor: [] };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  console.log("/u/:shortURL");
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(longURL);
  } else {
    res.redirect("/urls/new");
  }
});

app.get("/urls/:shortURL", (req, res) => {
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
    res.redirect("/urls/new");
  }
});

// UPDATE :shortURL
app.post("/urls/:shortURL", (req, res) => {
  console.log("POST /urls/:shortURL");
  if (req.session.user_id && urlsForUser(req.session.user_id, urlDatabase).includes(req.params.shortURL)) {

    urlDatabase[req.params.shortURL] = { longURL: req.body.newLongURL, userID: req.session.user_id , dateCreated: getCurrentDate(), numVisit: 0, uniqueVisitor: []};
  }
  console.log("After Edit:", urlDatabase);
  res.redirect("/urls");
})

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("POST /urls/:shortURL/delete");
  console.log("user_id: ", req.session.user_id);
  console.log("Urls for user:", urlsForUser(req.session.user_id, urlDatabase));
  console.log("shortURL:", req.params.shortURL)

  if (req.session.user_id && urlsForUser(req.session.user_id, urlDatabase).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
  }
  console.log("After Delete: ", urlDatabase);

  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});