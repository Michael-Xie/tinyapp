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
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  console.log(longURL);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(longURL);
  } else {
    res.redirect("/urls/new");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]/* What goes here? */ };
    res.render("urls_show", templateVars); 
  } else {
    res.redirect("/urls/new");
  }
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});