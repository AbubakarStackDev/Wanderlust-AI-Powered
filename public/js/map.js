// public/js/map.js
document.addEventListener("DOMContentLoaded", () => {
  const mapToken = "pk.eyJ1IjoiYWJ1YmFrYXItNSIsImEiOiJjbWs3OTQ5MDgwMDQxM2Vxd3l6amxhd3NjIn0.RSFUuyX6U7D4v6SLDjkMJg";
  mapboxgl.accessToken = mapToken;

  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // Read coordinates from data attributes (sent via EJS)
  const lat = parseFloat(mapElement.dataset.lat) || 17.3850; // default Hyderabad
  const lng = parseFloat(mapElement.dataset.lng) || 78.4867;
  const coordinates = [lng, lat];

  // Initialize the map
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 9
  });

  // Create a red marker with a popup
  new mapboxgl.Marker({ color: "red" })
    .setLngLat(coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${mapElement.dataset.title || "Listing"}</h4>
         <p>${mapElement.dataset.location || "Exact Location provided after booking"}</p>`
      )
    )
    .addTo(map);
});
