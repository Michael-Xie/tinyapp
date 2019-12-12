const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

const generateRandomString = function () {
  const alphaNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const numChar = 6;
  let shortURL = "";
  for (let i = 1; i <= numChar; i++) {
    let index = Math.floor(Math.random() * (alphaNum.length));
    shortURL += alphaNum[index];
  }
  return shortURL;
};

const filterUrlDB = function (urls, urlDatabase) {
  filteredDB = {};
  for (let url_id of urls) {
    if (urlDatabase[url_id]) {
      filteredDB[url_id] = urlDatabase[url_id]
    }
  }
  return filteredDB;
};

const urlsForUser = function (id, urlDatabase) {
  let urls = [];
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls.push(url);
    }
  }
  return urls;
};

const formatURL = function(url) {
  return url.startsWith("http://") || url.startsWith("https://")? url: `https://${url}`;
};

const getCurrentDate = function () {
  let date = new Date();
  return date.toDateString();
};

const hasVistorID = function (url_id, visitor_id, urlDatabase) {
  return urlDatabase[url_id].uniqueVisitor.includes(visitor_id);
};

module.exports = { hasVistorID, getCurrentDate, formatURL, urlsForUser, filterUrlDB, generateRandomString, getUserByEmail };