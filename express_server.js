// Load routes, libraries
const urlsRoutes = require('./routes/urls/urls');
const sessionRoutes = require('./routes/sessions/session');
const uRoutes = require('./routes/urls/u');

const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

// Set up express
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

// Use routes
app.use('/', sessionRoutes());
app.use('/u', uRoutes());
app.use('/urls', urlsRoutes());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});