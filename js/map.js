/* Interactive map (Leaflet + OpenStreetMap) */
if (window.L && document.getElementById('map')) {
  const pos = [-26.2041, 28.0473]; // Johannesburg
  const map = L.map('map').setView(pos, 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  L.marker(pos).addTo(map).bindPopup('<strong>Kunyarungo Agritech Solutions</strong><br>Johannesburg, South Africa').openPopup();
}
