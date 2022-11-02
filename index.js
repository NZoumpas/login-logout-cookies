const express = require("express");
const cookieParser = require("cookie-parser");
let app = express();
let { laptops, mobiles, users } = require("./data");

//signed cookies
app.use(cookieParser("abcdef-123456"));
app.use(express.json());

//middleware
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

//mobiles pages
app.get("/mobiles", function (req, res) {
  let userdata = req.signedCookies.userdata;
  console.log(`userdata : ${JSON.stringify(userdata)}`);
  if (!userdata) userdata = { user: "Guest", pages: [] };
  userdata.pages.push({ url: "/mobiles", date: Date.now() });
  res.cookie("userdata", userdata, { maxAge: 30000, signed: true });
  res.send(mobiles);
});
//laptops pages
app.get("/laptops", function (req, res) {
  let userdata = req.signedCookies.userdata;
  console.log(`userdata : ${JSON.stringify(userdata)}`);
  if (!userdata) userdata = { user: "Guest", pages: [] };
  userdata.pages.push({ url: "/laptops", date: Date.now() });
  res.cookie("userdata", userdata, { maxAge: 30000, signed: true });
  res.send(laptops);
});
//login set cookies
app.post("/login", function (req, res) {
  let { name, password } = req.body;
  let user = users.find((u) => u.name === name && u.password === password);
  if (!user) {
    res.status(401).send("Login Failed.Try Again.");
  } else {
    res.cookie(
      "userdata",
      { user: name, pages: [] },
      { maxAge: 30000, signed: true }
    );
    res.send("Login successfully maatje.");
  }
});

//logout stop cookies
app.get("/logout", function (req, res) {
  res.clearCookie("userdata");
  res.send("Cookies cleared");
});

app.get("/cookieData", function (req, res) {
  let userdata = req.signedCookies.userdata;
  res.send(userdata);
});

app.get("/users", function (req, res) {
  let userdata = req.signedCookies.userdata;
  let { user, pages } = userdata;
  if (!userdata || user === "Guest") {
    res.status(401).send("No access.Please login first");
  } else {
    let ul = users.find((u) => u.name === user);
    if (ul.role === "Admin") {
      let names = users.map((u) => u.name);
      res.send(names);
    } else {
      res.status(403).send("Forbindden..");
    }
  }
});

let port = 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
