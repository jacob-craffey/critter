import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import { Icon } from "leaflet";

const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  onClose: () => void;
}

const MapEvents = ({
  onLocationSelect,
}: {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}) => {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  onClose,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const defaultCenter = { lat: 41.8781, lng: -87.6298 }; // Chicago coordinates

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  return (
    <VStack spacing={4} width="100%">
      <Text>Click on the map to select a location</Text>
      <Box height="400px" width="100%" borderRadius="md" overflow="hidden">
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents onLocationSelect={handleLocationSelect} />
          {selectedLocation && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={icon}
            />
          )}
        </MapContainer>
      </Box>
      <Button
        colorScheme="blue"
        isDisabled={!selectedLocation}
        onClick={handleConfirm}
        width="full"
      >
        Confirm Location
      </Button>
    </VStack>
  );
};
