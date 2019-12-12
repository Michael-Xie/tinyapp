const { assert } = require('chai');

const { urlsForUser, filterUrlDB, generateRandomString, getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrls = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
    // Write your assert statement here
  });

  it('should return undefined with invalid email', function() {
    const user = getUserByEmail("invalid@example.com", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
    // Write your assert statement here
  });
});
// module.exports = { urlsForUser, filterUrlDB, generateRandomString, getUserByEmail };
describe('generateRandomString', function() {
  it('should return a string', function() {
    const actual = typeof generateRandomString();
    const expected = "string";
    assert.strictEqual(actual, expected);
  });

  it('should return false between two random strings', function() {
    const actual = generateRandomString() === generateRandomString();
    const expected = false;
    assert.strictEqual(actual, expected);
  });
});

describe('filterUrlDB', function() {
  it('should return an empty object if array of short urls doesn\'t exist', function() {
    const actual = filterUrlDB(["invalid", "invalid2"], testUrls);
    const expected = {};
    assert.deepEqual(actual, expected);
  });

  it('should return object with url object that exists in list of a valid short url', function() {
    const actual = filterUrlDB(["b6UTxQ"], testUrls);
    const expected = {b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" }};
    assert.deepEqual(actual, expected);
  });

  it('should return object with url objects that exist in list of two valid short urls', function() {
    const actual = filterUrlDB(["b6UTxQ", "i3BoGr"], testUrls);
    const expected = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
    };
    assert.deepEqual(actual, expected);
  });

  it('should return object with url objects that exist in list of two short urls (exist, not exist)', function() {
    const actual = filterUrlDB(["b6UTxQ", "notexist"], testUrls);
    const expected = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
    };
    assert.deepEqual(actual, expected);
  });
});

describe('urlsForUser', function() {
  it('should return an empty array if user has no shortURL', function() {
    const actual = urlsForUser("user", testUrls);
    const expected = [];
    assert.deepEqual(actual, expected);
  });

  it('should return an array with shortURL for user', function() {
    const actual = urlsForUser("userRandomID", testUrls);
    const expected = ["b6UTxQ"];
    assert.deepEqual(actual, expected);
  });
});
