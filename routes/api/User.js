const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const cookieParser = require("cookie-parser");
const cors = require("cors");

const router = express.Router();

// import input validation schemas
const { registerSchema, loginSchema } = require("../../config/inputValidation");

// use middleware
router.use(cors());
router.use(
  session({
    secret: process.env.SECRET || "secretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 90000 },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
  })
);
router.use(passport.initialize());
router.use(passport.session());
require("../../config/passportConfig")(passport);

// custom middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next({message: "Access allowed"});
  return res.status(401).json({ error: "Unauthorized request." });
};

const isNotLoggedIn = (req, res, next) => {
  if (req.user) res.status(400).json({ message: "You are already logged in" });
  next();
};

// user model
const User = require("../../models/user");

// user root route to get all users
router.get("/", isAuthenticated, async (_req, res) => {
  const allUsers = await User.findAll();
  if (allUsers.length === 0) {
    return res.json({ message: "There are no users in the database." });
  }
  return res.json(allUsers);
});

// user route to /register
router.post("/register", async (req, res) => {
  try {
    await registerSchema.validate(req.body, { abortEarly: false });
  } catch (error) {
    return res.status(400).json({
      error: `${error.name} => ${error.message}`,
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body?.password, 10);
    await User.create({
      name: req.body?.name,
      age: req.body?.age,
      email: req.body?.email,
      password: hashedPassword,
    });
    return res.json({ message: "User created successfully." });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError")
      return res.status(400).json({
        error: `${error.name}: Email address already exists.`,
      });
    return res.status(500).json({
      error: `${error.name} => ${error.message}.`,
    });
  }
});

// user route to /login
router.post("/login", isNotLoggedIn, async (req, res) => {
  try {
    await loginSchema.validate(req.body, { abortEarly: false });
  } catch (error) {
    return res
      .status(400)
      .json({ error: `${error.name} => ${error.message}.` });
  }
  try {
    passport.authenticate("local", (error, user, info) => {
      if (error) return res.status(500).json({ error: error.message });
      if (!user) return res.status(400).json({ error: info.message });
      req.logIn(user, (error) => {
        if (error) return res.status(500).json({ error: error.message });
        return res.json(user);
      });
    })(req, res);
  } catch (error) {
    if (error)
      return res
        .status(500)
        .json({ error: `${error.name} => ${error.message}.` });
  }
});

// user route to /logout
// router.post(
//   "/logout",
//   isAuthenticated,
//   (req, res) => {
//     res.clearCookie("connect.sid", { path: "/" });
//     req.session.destroy((error) => {
//       if (error) return res.status(500).json({ error });
//     });
//     next();
//   },
//   (req, res) => {
//     return res.json({ message: "User logged out successfully." });
//   }
// );

router.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
  });
  res.redirect("/");
});

// user route to update user

// user route to delete user

module.exports = router;
