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


app.use(errorHandlerMiddleware);
const port = process.env.PORT || 4000;


const auth = (req, res, next) => {
  const { name, email, password } = req.body;
  
  const token = req.cookies.token;
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, process.env.MY_SECRET);
    console.log("cookie data", data);
    req.userId = data.id;
    req.userRole = data.role;
    return next();
  } catch {
    return res.sendStatus(403);
  }
};

app.use("/todos", auth, todos);

app.get("/users", auth , async (req, res) => {
  try {
    const users = await User({});
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});


app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await new User({
      name: name,
      email: email,
      password: hashedPassword,
    });
    newUser.save().then((user) => {
      jwt.sign(
        user.password,
        process.env.MY_SECRET,
        (err, token) => {
          if (err) {
            console.log(err);
            res.status(500);
          } else {
            res
              .cookie("token", token)
              .json({result: "success", id: user._id, email: user.email });
          }
        }
      );
    });
});



app.post("/login",  (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).then((user) => {
    console.log(user)
    if (!user) {
      return res.status(403).json({msg: "invalid login"});

    }
    const validData = bcrypt.compareSync(password, user.password);
    console.log(validData)
    if (validData) {
      jwt.sign(
        { id: user._id, email: user.email },
        process.env.MY_SECRET,
        (err, token) => {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            res
              .cookie("token", token)
              .json({ id: user._id, email: user.email });
          }
        }
      );
    } else {
      res.sendStatus(401);
    }
  });
});



app.post("/logout", auth, (req, res) => {
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