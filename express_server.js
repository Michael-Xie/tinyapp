const { hasVistorID, getCurrentDate, formatURL, urlsForUser, generateRandomString, getUserByEmail, filterUrlDB } = require("./helpers");
const { urlDatabase, users } = require("./starting-data");

const urlsRoutes = require('./routes/urls/urls');
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));


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

app.use('/urls', urlsRoutes());




app.get("/u/:shortURL", (req, res) => {
  console.log("/u/:shortURL");
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(longURL);
  } else {
    res.redirect("/urls/new");
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});