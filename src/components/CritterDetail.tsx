import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  VStack,
  Text,
  Box,
  Grid,
  GridItem,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Critter } from "@/models/types";
import { pb } from "@/services/pocketbase";

interface CritterDetailProps {
  critter: Critter;
  isOpen: boolean;
  onClose: () => void;
}

const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CritterDetail: React.FC<CritterDetailProps> = ({
  critter,
  isOpen,
  onClose,
}) => {
  const bgColor = useColorModeValue("white", "darkGreen.800");
  const borderColor = useColorModeValue("sage.200", "sage.600");
  const textColor = useColorModeValue("darkGreen.800", "cream.50");

  const getImageUrl = (record: any) => {
    return pb.files.getURL(record, record.photo);
  };

  const position: [number, number] = [
    parseFloat(critter.latitude),
    -parseFloat(critter.longitude),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent
        bg={bgColor}
        borderColor={borderColor}
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        maxW="800px"
      >
        <ModalHeader
          fontFamily="'Kalam', cursive"
          color={textColor}
          borderBottom="1px"
          borderColor={borderColor}
          pb={4}
        >
          {critter.nick_name || critter.species_name}
        </ModalHeader>
        <ModalCloseButton color={textColor} />

        <ModalBody p={6}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem>
              <Image
                src={critter.photo ? getImageUrl(critter) : ""}
                alt={critter.species_name}
                borderRadius="md"
                w="100%"
                objectFit="cover"
                border="2px solid"
                borderColor={borderColor}
              />
            </GridItem>

            <GridItem>
              <VStack align="stretch" spacing={4}>
                <Box>
                  {critter.nick_name && (
                    <Text fontSize="lg" color="sage.500" fontStyle="italic">
                      {critter.species_name}
                    </Text>
                  )}
                  <Badge
                    colorScheme="green"
                    variant="subtle"
                    fontSize="sm"
                    mt={2}
                  >
                    Spotted on{" "}
                    {new Date(critter.date_spotted).toLocaleDateString()}
                  </Badge>
                </Box>

                {critter.notes && (
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={textColor}
                      mb={1}
                    >
                      Notes
                    </Text>
                    <Text
                      fontSize="md"
                      color={textColor}
                      fontFamily="'Kalam', cursive"
                    >
                      {critter.notes}
                    </Text>
                  </Box>
                )}

                <Box h="200px" borderRadius="md" overflow="hidden">
                  <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={position} icon={icon}>
                      <Popup>Spotted here!</Popup>
                    </Marker>
                  </MapContainer>
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={textColor}
                    mb={1}
                  >
                    Location
                  </Text>
                  <Text fontSize="sm" color="sage.500">
                    {critter.latitude}, {critter.longitude}
                  </Text>
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CritterDetail;
