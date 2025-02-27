import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { Box } from "@chakra-ui/react";
import { useEffect } from "react";

// Fix for default marker icon in react-leaflet
const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapViewProps {
  lat: number;
  lng: number;
}

// This component handles map updates
const MapUpdater: React.FC<MapViewProps> = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({ lat, lng }) => {
  // Negate the longitude to correct the position
  const correctedLng = -lng;

  return (
    <Box height="200px" width="100%" borderRadius="md" overflow="hidden">
      <MapContainer
        center={[lat, correctedLng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <MapUpdater lat={lat} lng={correctedLng} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, correctedLng]} icon={icon}>
          <Popup>
            Location: {lat.toFixed(6)}, {lng.toFixed(6)}
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
};

export default MapView;
