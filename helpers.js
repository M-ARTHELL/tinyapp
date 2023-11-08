// finds user in user datbase and returns the associated key, returns false if email does not exist
const getUserByEmail = function (email, database) {
  for (const user in database) {

    if (database[user].email === email) {
      return user;
    }
  }
  return undefined;
}

// generates a random 6 character string
function generateRandomString() {
  let result = "";
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  while (result.length < 6) {
    result += chars[Math.floor(Math.random () * ((chars.length - 1) + 1)) + 0];
  }
  return result;
}

// returns urls that contain the user ID used as a parameter
const urlsForUser = function(id, database) {
  let usersUrls = {};
  for (const urlID in database) {
    if (database[urlID].userID === id) {
      usersUrls[urlID] = database[urlID];
    }
  }
  return usersUrls;
}


module.exports = {getUserByEmail, generateRandomString, urlsForUser};