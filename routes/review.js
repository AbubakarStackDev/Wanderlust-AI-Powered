const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn } = require("../middleware");

const reviewcontroller = require("../controllers/reviews.js");

// ================= REVIEWS ROUTES =================

// CREATE REVIEW
router
  .route("/")
  .post(
    isLoggedIn,
    validateReview,
    wrapAsync(reviewcontroller.createReview)
  );

// DELETE REVIEW
router
  .route("/:reviewId")
  .delete(
    isLoggedIn,
    wrapAsync(reviewcontroller.destroyReview)
  );

module.exports = router;
