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
}

const urlsForUser = function (id, urlDatabase) {
  let urls = [];
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls.push(url);
    }
  }
  return urls;
}

module.exports = { urlsForUser, filterUrlDB, generateRandomString, getUserByEmail };