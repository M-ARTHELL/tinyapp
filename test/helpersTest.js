const { assert } = require('chai');
const { getUserByEmail, urlsForUser, generateRandomString } = require('../helpers.js');

///////////////////////////////////////////////////////////
// DATABASES
///////////////////////////////////////////////////////////

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

// urls
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

///////////////////////////////////////////////////////////
// TESTS
///////////////////////////////////////////////////////////

//getUserByEmail
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.deepEqual(user, expectedUserID);
  });
});

describe('getUserByEmail', function() {
  it('should return undefined', function() {
    const user = getUserByEmail("test@example.com", testUsers)
    assert.deepEqual(user, undefined);
  });
});


//urlsForUser
describe('urlsForUser', function() {
  it('should return urls associated with the user', function() {
    assert.deepEqual(urlsForUser("userRandomID", urlDatabase), {b6UTxQ: {longURL: "https://www.tsn.ca", userID: "userRandomID",}});
  });
});

describe('urlsForUser', function() {
  it('should return empty object', function() {
    assert.deepEqual(urlsForUser("userRandomID2", urlDatabase), {});
  });
});


//generateRandomString
describe('generateRandomString', function() {
  it('should return a 6 character string', function() {
    const randomString = generateRandomString();
    assert.equal(randomString.length, 6);
  });
});