const { getCurrentDate } = require("./helpers");

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

module.exports = { urlDatabase, users };