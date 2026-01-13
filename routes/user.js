const express = require("express");
const router = express.Router();

const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controllers/users.js");

// ================= SIGNUP =================

router
  .route("/signup")
  .get(userController.rendersignupForm)   // SHOW SIGNUP FORM
  .post(wrapAsync(userController.signup)); // HANDLE SIGNUP

// ================= LOGIN =================

router
  .route("/login")
  .get(userController.renderLoginForm) // SHOW LOGIN FORM
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

// ================= LOGOUT =================

router.get("/logout", userController.logout);

module.exports = router;
