import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  Text,
  Image,
  useColorModeValue,
  Heading,
  Badge,
  IconButton,
  useBreakpointValue,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { Icon } from "leaflet";
import { Critter } from "@/models/types";
import { pb } from "@/services/pocketbase";

// Add this new component for map control
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMapEvents({});

  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);

  return null;
};

// Update the marker icon to be more nature-themed
const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapListViewProps {
  critters: Critter[];
}

const MapListView: React.FC<MapListViewProps> = ({ critters }) => {
  const [selectedCritter, setSelectedCritter] = useState<Critter | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Determine if we're on mobile
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Updated color scheme using nature-inspired colors
  const borderColor = useColorModeValue("sage.200", "sage.600");
  const bgColor = useColorModeValue("cream.50", "darkGreen.900");
  const selectedBgColor = useColorModeValue("sage.100", "sage.700");
  const hoverBgColor = useColorModeValue("cream.100", "sage.600");

  const getImageUrl = (record: any) => {
    return pb.files.getURL(record, record.photo, { thumb: "100x100" });
  };

  // Get center coordinates based on selected critter or default to first critter or Chicago
  const getMapCenter = (): [number, number] => {
    if (selectedCritter) {
      return [
        parseFloat(selectedCritter.latitude),
        parseFloat(selectedCritter.longitude),
      ];
    } else if (critters.length > 0) {
      return [
        parseFloat(critters[0].latitude),
        parseFloat(critters[0].longitude),
      ];
    }
    return [41.8781, -87.6298]; // Chicago coordinates as default
  };

  const handleCritterSelect = (critter: Critter) => {
    setSelectedCritter(critter);
  };

  const SidebarContent = () => (
    <VStack spacing={2} align="stretch" p={2} overflowY="auto" flex={1}>
      {critters.map((critter) => (
        <Box
          key={critter.id}
          p={3}
          cursor="pointer"
          borderRadius="md"
          bg={
            selectedCritter?.id === critter.id ? selectedBgColor : "transparent"
          }
          _hover={{ bg: hoverBgColor }}
          onClick={() => {
            handleCritterSelect(critter);
            if (isMobile) onClose();
          }}
          transition="all 0.2s"
          border="1px solid"
          borderColor={
            selectedCritter?.id === critter.id ? "sage.300" : "transparent"
          }
        >
          <Flex gap={4}>
            <Image
              src={getImageUrl(critter)}
              alt={critter.species_name}
              boxSize="60px"
              objectFit="cover"
              borderRadius="lg"
              border="2px solid"
              borderColor="sage.200"
            />
            <Box>
              <Text
                fontWeight="bold"
                color="darkGreen.800"
                fontFamily="'Kalam', cursive"
              >
                {critter.nick_name || critter.species_name}
              </Text>
              {critter.nick_name && (
                <Text fontSize="sm" color="sage.600" fontStyle="italic">
                  {critter.species_name}
                </Text>
              )}
              <Flex gap={2} mt={1}>
                <Badge colorScheme="green" variant="subtle" fontSize="xs">
                  {new Date(critter.date_spotted).toLocaleDateString()}
                </Badge>
              </Flex>
            </Box>
          </Flex>
        </Box>
      ))}
    </VStack>
  );

  return (
    <Flex h="calc(100vh - 64px)" bg={bgColor}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Flex
          w="350px"
          borderRight="1px"
          borderColor={borderColor}
          bg={bgColor}
          boxShadow="lg"
          direction="column"
        >
          <Box
            p={4}
            borderBottom="1px"
            borderColor={borderColor}
            position="sticky"
            top={0}
            bg={bgColor}
            zIndex={1}
          >
            <Heading
              size="md"
              color="darkGreen.700"
              fontFamily="'Kalam', cursive"
            >
              Your Collection
            </Heading>
            <Text fontSize="sm" color="sage.600">
              {critters.length} critters spotted
            </Text>
          </Box>
          <SidebarContent />
        </Flex>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
          <DrawerOverlay />
          <DrawerContent bg={bgColor}>
            <DrawerHeader
              borderBottomWidth="1px"
              borderColor={borderColor}
              p={4}
            >
              <Flex justify="space-between" align="center">
                <Heading
                  size="md"
                  color="darkGreen.700"
                  fontFamily="'Kalam', cursive"
                >
                  Your Collection ({critters.length})
                </Heading>
                <IconButton
                  aria-label="Close drawer"
                  icon={<FontAwesomeIcon icon={faXmark} />}
                  onClick={onClose}
                  variant="ghost"
                />
              </Flex>
            </DrawerHeader>
            <DrawerBody p={0}>
              <SidebarContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {/* Map Container */}
      <Box flex={1} position="relative">
        {isMobile && (
          <IconButton
            aria-label="Open list"
            icon={<FontAwesomeIcon icon={faList} />}
            position="absolute"
            top={4}
            right={4}
            zIndex={999}
            onClick={onOpen}
            colorScheme="green"
            size="lg"
            boxShadow="lg"
          />
        )}
        <MapContainer
          center={getMapCenter()}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController center={getMapCenter()} />
          {critters.map((critter) => (
            <Marker
              key={critter.id}
              position={[
                parseFloat(critter.latitude),
                parseFloat(critter.longitude),
              ]}
              icon={icon}
              eventHandlers={{
                click: () => handleCritterSelect(critter),
              }}
            >
              <Popup className="custom-popup">
                <Box p={3} maxW="250px">
                  <Image
                    src={getImageUrl(critter)}
                    alt={critter.species_name}
                    w="100%"
                    h="150px"
                    objectFit="cover"
                    borderRadius="md"
                    mb={3}
                  />
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color="darkGreen.800"
                    fontFamily="'Kalam', cursive"
                  >
                    {critter.nick_name || critter.species_name}
                  </Text>
                  {critter.nick_name && (
                    <Text fontSize="sm" color="sage.600" fontStyle="italic">
                      {critter.species_name}
                    </Text>
                  )}
                  <Text fontSize="sm" color="sage.500" mt={2}>
                    Spotted on{" "}
                    {new Date(critter.date_spotted).toLocaleDateString()}
                  </Text>
                  {critter.notes && (
                    <Text
                      fontSize="sm"
                      mt={2}
                      color="darkGreen.700"
                      fontFamily="'Kalam', cursive"
                    >
                      {critter.notes}
                    </Text>
                  )}
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Flex>
  );
};

export default MapListView;
