const { render } = require("ejs");
const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  let result = "";
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  while (result.length < 6) {
    result += chars[Math.floor(Math.random () * (chars.length + 1)) + 0];
  }
  return result;
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

const findUser = function (email) {
  for (const user in users) {

    if (users[user].email === email) {
      return user;
    }
  }
  return false;
}


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
})

app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/")
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
})

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]

  if (urlDatabase[req.params.id]) {
    res.redirect(longURL);
  } else {
    res.redirect('/404');
  }

});

app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"]
  };

  res.render("login", templateVars);
})

app.post("/login", (req, res) => {

  if (req.body.email && req.body.password) {
    let userID = findUser(req.body.email);

    if (userID === false) {
      res.status(400).send("User does not exist")
      
    } else if (users[userID].email === req.body.email) {

      if (users[userID].password === req.body.password) {
        res.cookie('user_id', userID)
        res.redirect('/urls')

      } else {
        res.status(400).send("Incorrect password")
      }
    }
  } else {
  res.status(400).send("Form missing input")
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"]
  };
  res.render("registration", templateVars);
})

app.post("/register", (req, res) => {
  const randomID = generateRandomString();

  if (req.body.email && req.body.password) {
    const userID = findUser(req.body.email)

    if (userID === false) {
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: req.body.password,
      }
      res.cookie('user_id', randomID)
      res.redirect('/urls')

    } else if (users[userID].email === req.body.email) {
        res.status(400).send(`Email ${req.body.email} already in use`)
    }

  } else {
    res.status(400).send("Form missing input")
  }
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/404", (req, res) => {
  res.send("<html><body><h1>404: Not Found</h1></body></html>\n");
});