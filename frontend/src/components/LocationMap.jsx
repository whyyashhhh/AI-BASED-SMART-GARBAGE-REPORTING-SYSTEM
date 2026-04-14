import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export function LocationMap({ latitude, longitude }) {
  if (latitude == null || longitude == null || Number.isNaN(Number(latitude)) || Number.isNaN(Number(longitude))) {
    return <div className="empty-state">Enter coordinates to preview the complaint location.</div>;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom={false} className="leaflet-map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker center={[lat, lng]} radius={10} pathOptions={{ color: '#69a7ff', fillColor: '#69a7ff', fillOpacity: 0.8 }}>
        <Popup>Complaint reported here</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
