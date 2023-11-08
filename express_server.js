///////////////////////////////////////////////////////////
// SETUP
///////////////////////////////////////////////////////////

const {render} = require("ejs");
const express = require("express");
const cookieSession = require("cookie-session");
const {getUserByEmail, generateRandomString, urlsForUser} = require("./helpers")
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080
const cookieKey = bcrypt.hashSync("mysterykey", 10);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: [cookieKey],

  // cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// listing for requests on port specified by variable, prints it in console
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


///////////////////////////////////////////////////////////
// DATABASES
///////////////////////////////////////////////////////////

// urls
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
}

///////////////////////////////////////////////////////////
// ROUTES
///////////////////////////////////////////////////////////

// home redirect
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
});


// url listing
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };

  if (req.session.user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send("Please login first")
  }
});


// new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }

  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  if (req.session.user_id) {
    urlDatabase[shortURL] = {"longURL": req.body["longURL"], "userID": req.session.user_id}
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).send("Please login first")
  }
});


// url page
app.get("/urls/:id", (req, res) => {
  if (req.session.user_id) {

    if (urlDatabase[req.params.id]) {

      // if user is logged in and the link id still exists, compares the current user logged in with the user associated with the link, and loads the page if they match
      if (req.session.user_id === urlDatabase[req.params.id].userID) {
        const templateVars = {
          id: req.params.id,
          longURL: urlDatabase[req.params.id].longURL,
          user: users[req.session.user_id]
        };
        res.render("urls_show", templateVars);

      } else {
        res.status(400).send("Cannot view another user's link")
      }
    } else {
      res.status(400).send("URL not found")
    }
  } else {
    res.status(400).send("Please login first")
  }
})

app.post("/urls/:id/", (req, res) => {
  if (req.session.user_id) {

    if (urlDatabase[req.params.id]) {

      // if user is logged in and the link id still exists, compares the current user logged in with the user associated with the link, and proceeds to edit the link if they match
      if (req.session.user_id === urlDatabase[req.params.id].userID) {
        urlDatabase[req.params.id].longURL = req.body.longURL;
        res.redirect("/urls")
        
      } else {
        res.status(400).send("Cannot edit another user's URL")
      }
    } else {
      res.status(400).send("URL not found")
    }
  } else {
    res.status(400).send("Please login first")
  }
})


// delete url
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id) {

    if (urlDatabase[req.params.id]) {

            // if user is logged in and the link id still exists, compares the current user logged in with the user associated with the link, and proceeds to delete the link if they match
      if (req.session.user_id === urlDatabase[req.params.id].userID) {
        delete urlDatabase[req.params.id];
        res.redirect('/urls');

      } else {
        res.status(400).send("Cannot delete another user's URL")
      }
    } else {
      res.status(400).send("URL not found")
    }
  } else {
    res.status(400).send("Please login first")
  }
})


// redirects short link to long link
app.get("/u/:id", (req, res) => {

  //checks database for short url and redirects to long url if found
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL
    res.redirect(longURL);

  } else {
    // otherwise, sends 403 code and "url not found" message
    res.status(403).send("URL not found");
  }
});


// login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };

  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.render("login", templateVars);
  }
})


// login process
app.post("/login", (req, res) => {

  //checks if email/password forms are filled
  if (req.body.email && req.body.password) {
    let userID = getUserByEmail(req.body.email, users);

    // if user doesn't exist in database, send code 403 and "not found" message
    if (userID === undefined) {
      res.status(403).send("User not found")
      
    } else if (users[userID].email === req.body.email) {

      // if user exists and the email and password match, set user_id cookie to log user in, and redirect to /urls
      if (bcrypt.compareSync(req.body.password, users[userID].password)) {

        req.session.user_id = userID;
        res.redirect('/urls')

      } else {
        // if password doesn't match, send 403 code and "incorrect password" message
        res.status(403).send("Incorrect password")
      }
    }
  } else {
  // if email or password is blank, send code 400 and "missing input" message
  res.status(400).send("Form missing input")
  }
})


// logout
// clears user_id cookie and redirects to login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
})


// register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };

  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.render("registration", templateVars);
  }
})


// registration process
app.post("/register", (req, res) => {

  // if email and password forms are filled, check if user already exists in user database
  if (req.body.email && req.body.password) {
    const userID = getUserByEmail(req.body.email, users)

    // if user does not exist in database, generate a random string, set it as the key and user id, and set the email and password provided
    if (userID === undefined) {
      const randomID = generateRandomString();
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
      }

      // then, set user_id cookie to log user in, and redirect to /urls
      req.session.user_id = randomID;
      res.redirect('/urls')

    // if user is found in database, send code 400 and "email in use" message
    } else if (users[userID].email === req.body.email) {
        res.status(400).send(`Email ${req.body.email} already in use`)
    }

  // if email or password is left blank, send code 400 and "missing input" message
  } else {
    res.status(400).send("Form missing input")
  }
})