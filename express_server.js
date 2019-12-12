function generateRandomString() {
  const alphaNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const numChar = 6;
  let shortURL = "";
  for (let i = 1; i <= numChar; i++) {
    let index = Math.floor(Math.random() * (alphaNum.length));
    shortURL += alphaNum[index];
  }
  return shortURL;

}

const {getUserByEmail} = require("./helpers");
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};


const filterUrlDB = function (urls) {
  filteredDB = {};
  for (let url_id of urls) {
    if (urlDatabase[url_id]) {
      filteredDB[url_id] = urlDatabase[url_id]
    }
  }
  return filteredDB;
}

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

const hasEmail = function (email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}

const urlsForUser = function (id) {
  let urls = [];
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls.push(url);
    }
  }
  return urls;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.status(403).send("Email not found. Try again.")
  } else if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send("Password doesn't match. Try Again.")
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let filteredURLDB = filterUrlDB(urlsForUser(req.session["user_id"]));
  let templateVars = { urls: filteredURLDB, user: users[req.session["user_id"]] };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  // urlDatabase[req.params.shortURL] = req.body.newLongURL;
  // console.log(urlDatabase);
  let userID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please fill in both your email and password");
    return;
  } else if (hasEmail(req.body.email)) {
    res.status(400).send("Email already exist. Try another one.");
    return;
  } else {
    users[userID] = { id: userID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
    req.session.user_id = userID;
    console.log(users);

    res.redirect("/urls");
  }
})

app.get("/login", (req, res) => {
  let filteredURLDB = filterUrlDB(urlsForUser(req.session["user_id"]));
  let templateVars = { urls: filteredURLDB, user: users[req.session["user_id"]] };
  console.log(users);
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  // let filteredURLDB = filterUrlDB(urlsForUser(req.session["user_id"]));
  let filtred = filterUrlDB(urlsForUser(req.session["user_id"]))
  let templateVars = { urls: filtred, user: users[req.session["user_id"]] };
  console.log("filteredURLDB at url_index:", filtred);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
    let templateVars = { user: users[req.session["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    let templateVars = { user: users[req.session["user_id"]] };
    res.render("login", templateVars)
  }
});

// ADD new entry
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  console.log(longURL);
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session["user_id"] };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(longURL);
  } else {
    res.redirect("/urls/new");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(401).send("Please log in to see page");
    return;
  }
  console.log("shorturl:", req.params.shortURL);
  console.log("user urls: ", urlsForUser(req.session["user_id"]));
  console.log("compare result: ", urlsForUser(req.session["user_id"]).includes(req.params.shortURL));


  if (!(urlsForUser(req.session["user_id"]).includes(req.params.shortURL))) {
    res.status(401).send(`shortURL: ${req.params.shortURL} doesn't belong to you.`)
    return;
  }

  if (urlDatabase[req.params.shortURL]) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session["user_id"]] };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/urls/new");
  }
});

// UPDATE :shortURL
app.post("/urls/:shortURL", (req, res) => {
  if (req.session["user_id"] && urlsForUser(req.session["user_id"]).includes(req.params.shortURL)) {

    urlDatabase[req.params.shortURL] = { longURL: req.body.newLongURL, userID: req.session["user_id"] };
  }
  console.log("After Edit:", urlDatabase);
  res.redirect("/urls");
})

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session["user_id"] && urlsForUser(req.session["user_id"]).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
  }
  console.log("After Delete: ", urlDatabase);

  res.redirect("/urls");
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});