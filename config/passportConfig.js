const User = require("../models/user");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } });
          if (!user) {
            return done(null, false, {
              message: "Email or passport incorrect",
            });
          }
          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
            return done(null, {
              name: user.name,
              email: user.email,
            });
          } else {
            return done(null, false, { message: "Password incorrect" });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findByPk(id, (err, user) => {
      done(err, user);
    });
  });
};
