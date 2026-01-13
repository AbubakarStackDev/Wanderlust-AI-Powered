const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// --------------------
// INDEX - Show all listings (Updated for Filtering)
// --------------------
module.exports.index = async (req, res) => {
  const { category } = req.query; 
  let filter = {};
  if (category) {
    filter = { category: category }; 
  }
  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", { allListings });
};

// --------------------
// SEARCH - New function for your Search Bar
// --------------------
module.exports.searchListing = async (req, res) => {
  let { title } = req.query; // Captures "title" from your navbar input
  
  // Find listings where title, location, or country match the search
  // Using $regex with $options: "i" makes it case-insensitive
  const allListings = await Listing.find({
    $or: [
      { title: { $regex: title, $options: "i" } },
      { location: { $regex: title, $options: "i" } },
      { country: { $regex: title, $options: "i" } }
    ]
  });

  if (allListings.length === 0) {
    req.flash("error", "No destinations found for your search!");
    return res.redirect("/listings");
  }

  res.render("listings/index.ejs", { allListings });
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
module.exports.showListing = async (req, res) => {
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

    const url = req.file?.path;
    const filename = req.file?.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (url && filename) newListing.image = { url, filename };
    if (geometry) newListing.geometry = geometry; 

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
module.exports.renderEditForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image?.url;
  if (originalImageUrl) originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// --------------------
// UPDATE LISTING
// --------------------
module.exports.updateListing = async (req, res) => {
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
};

// --------------------
// DELETE LISTING
// --------------------
module.exports.destroyListing = async (req, res) => {
  const deletedListing = await Listing.findByIdAndDelete(req.params.id);
  if (!deletedListing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};