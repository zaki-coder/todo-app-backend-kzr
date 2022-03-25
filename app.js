const express = require("express");
const app = express();
const todos = require("./routes/todos");
const connectDB = require("./db/connect");
require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const User = require("./models/user.model");

const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const errorHandlerMiddleware = require("./middleware/error-handler");

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use("/todos", todos);

app.use(errorHandlerMiddleware);
const port = process.env.PORT || 4000;


app.get("/", (req, res) => {
  res.send("ok");
});


app.get("/user", (req, res) => {
  if (!req.cookies.token) {
    return res.json({});
  }
  const payload = jwt.verify(req.cookies.token, process.env.MY_SECRET);
  User.findById(payload.id).then((userData) => {
    if (!userData) {
      return res.json({msg: 'No user found'});
    }
    res.json({ id: userData._id, email: userData.email });
  });
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });
    newUser.save().then((userData) => {
      jwt.sign(
        { id: userData._id, email: userData.email },
        process.env.MY_SECRET,
        (err, token) => {
          if (err) {
            console.log(err);
            res.status(500);
          } else {
            res
              .cookie("token", token)
              .json({ id: userData._id, email: userData.email });
          }
        }
      );
    });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).then((userData) => {
    console.log(userData)
    if (!userData) {
      return res.json({});
    }
    const passOk = bcrypt.compareSync(password, userData.password);
    if (passOk) {
      jwt.sign({ id: userData._id, email }, process.env.MY_SECRET, (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res
            .cookie("token", token)
            .json({ id: userData._id, email: userData.email });
        }
      });
    } else {
      res.sendStatus(401);
    }
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").send();
});


const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();