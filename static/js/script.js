let map = L.map('map').setView([20.5937, 78.9629], 5); // default to India

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

let route = [];
let polyline = null;
let userMarker = null;  // This is for pinpointing location

function checkNetwork() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const netStatus = document.getElementById("network-status");

  if (connection) {
    let speed = connection.downlink;
    let type = connection.effectiveType;
    netStatus.textContent = `Network Type: ${type}, Speed: ${speed} Mbps`;

    if (speed < 1 || type === '2g') {
      netStatus.style.color = "yellow";
      alert("⚠️ Weak Network. SafeWalk may not track reliably!");
    } else {
      netStatus.style.color = "lightgreen";
    }
  } else {
    netStatus.textContent = "Network info not supported";
  }
}

function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.watchPosition(position => {
    const { latitude, longitude } = position.coords;
    const latlng = [latitude, longitude];

    // ✅ Pinpoint: add/update user marker
    if (!userMarker) {
      userMarker = L.marker(latlng).addTo(map).bindPopup("📍 You are here").openPopup();
    } else {
      userMarker.setLatLng(latlng);
    }

    map.setView(latlng, 16);  // Zoom to user's location

    // Draw path
    route.push(latlng);
    if (!polyline) {
      polyline = L.polyline(route, { color: 'blue' }).addTo(map);
    } else {
      polyline.setLatLngs(route);
    }

    L.circleMarker(latlng, { radius: 3, color: 'red' }).addTo(map);

    // Send to backend
    fetch('/send_location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, timestamp: new Date() })
    });

  }, error => {
    console.error("Geolocation error:", error.message);
    alert("❌ Location access denied or unavailable.");
  }, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
  });
}

// 🚨 SOS Button Logic
document.getElementById("sos-button").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const locationURL = `https://www.google.com/maps?q=${latitude},${longitude}`;

    // 1. Alert user
    alert(`🚨 Emergency Location:\nLat: ${latitude}, Lng: ${longitude}\n\nOpening dialer and notifying emergency contact.`);

    // 2. Contact emergency number (opens dialer)
    window.open("tel:112");  // use 911 or local number

    // 3. Notify emergency contact (backend)
    fetch('/sos_alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude, longitude,
        maps_url: locationURL,
        time: new Date().toISOString()
      })
    }).then(res => res.json()).then(data => {
      console.log("Emergency contact notified:", data);
    });

  }, err => {
    alert("Failed to get location for SOS alert.");
    console.error(err);
  });
});


checkNetwork();
startTracking();
