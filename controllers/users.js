const User = require("../models/user");   // ✅ MISSING LINE (VERY IMPORTANT)

// ================= SIGNUP =================

// SHOW SIGNUP FORM
module.exports.rendersignupForm = (req, res) => {
  res.render("users/signup");
};

// HANDLE SIGNUP
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    // auto login after signup
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect(res.locals.redirectUrl || "/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// ================= LOGIN =================

// SHOW LOGIN FORM
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

// HANDLE LOGIN
module.exports.login = (req, res) => {
  req.flash("success", "Welcome to Wanderlust! You are logged in!");
  res.redirect(res.locals.redirectUrl || "/listings");
};

// ================= LOGOUT =================

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
