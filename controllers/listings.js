const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Escape regex special characters for search
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// --------------------
// INDEX - Show all listings (Updated for Filtering)
// --------------------
module.exports.index = async (req, res, next) => {
  try {
    const { category } = req.query; 
    let filter = {};
    if (category) filter = { category }; 
    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    next(err);
  }
};

// --------------------
// SEARCH - New function for your Search Bar
// --------------------
module.exports.searchListing = async (req, res, next) => {
  try {
    let { title } = req.query; 
    if (!title) return res.redirect("/listings");

    const safeTitle = escapeRegex(title);

    const allListings = await Listing.find({
      $or: [
        { title: { $regex: safeTitle, $options: "i" } },
        { location: { $regex: safeTitle, $options: "i" } },
        { country: { $regex: safeTitle, $options: "i" } }
      ]
    });

    if (allListings.length === 0) {
      req.flash("error", "No destinations found for your search!");
      return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    next(err);
  }
};

// --------------------
// RENDER NEW FORM
// --------------------
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// --------------------
// SHOW SINGLE LISTING
// --------------------
module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" } 
      })
      .populate("owner"); 

    if (!listing) {
      req.flash("error", "Requested listing does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err);
  }
};

// --------------------
// CREATE LISTING WITH MAPBOX GEOCODING
// --------------------
module.exports.createListing = async (req, res, next) => {
  try {
    const locationQuery = req.body.listing.location;

    const geoData = await geocodingClient.forwardGeocode({
      query: locationQuery,
      limit: 1
    }).send();

    const geometry = geoData.body.features[0]?.geometry;
    if (!geometry) {
      req.flash("error", "Could not find the location!");
      return res.redirect("/listings/new");
    }

    const url = req.file?.path;
    const filename = req.file?.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (url && filename) newListing.image = { url, filename };
    newListing.geometry = geometry; 

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

// --------------------
// RENDER EDIT FORM
// --------------------
module.exports.renderEditForm = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url;
    if (originalImageUrl) originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
  } catch (err) {
    next(err);
  }
};

// --------------------
// UPDATE LISTING
// --------------------
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, {
      runValidators: true,
      new: true
    });

    if (!updatedListing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

// --------------------
// DELETE LISTING
// --------------------
module.exports.destroyListing = async (req, res, next) => {
  try {
    const deletedListing = await Listing.findByIdAndDelete(req.params.id);
    if (!deletedListing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};
