import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  ModalFooter,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { critterService } from "@/services/CritterService";
import { Critter, ImageMetadata } from "@/models/types";
import { ImageDropzone } from "./ImageDropZone";
import { LocationPicker } from "./LocationPicker";
import { imageClassificationService } from "@/services/ImageClassificationService";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Icon } from "@chakra-ui/react";
import ExifReader from "exifreader";

interface CritterFormProps {
  critter?: Critter;
  isOpen: boolean;
  onClose: () => void;
  onSave: (critter: Critter) => void;
  initialFile?: File;
}

const CritterForm: React.FC<CritterFormProps> = ({
  critter,
  isOpen,
  onClose,
  onSave,
  initialFile,
}) => {
  const toast = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [species, setSpecies] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(
    null
  );
  const [preview, setPreview] = useState<string>("");
  const [isProcessingMetadata, setIsProcessingMetadata] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  const [formData, setFormData] = useState<Omit<Critter, "user_id">>({
    species_name: "",
    nick_name: "",
    date_spotted: "",
    photo: "",
    notes: "",
    latitude: "",
    longitude: "",
  });

  const handleImageSelect = async (file: File) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));

    // Start metadata processing
    setIsProcessingMetadata(true);
    try {
      const metadata = await extractImageMetadata(file);
      handleMetadataExtracted(metadata);
    } finally {
      setIsProcessingMetadata(false);
    }

    // Start species classification
    setIsClassifying(true);
    try {
      const species = await imageClassificationService.classifyImage(file);
      if (species) {
        handleSpeciesDetected(species);
      }
    } finally {
      setIsClassifying(false);
    }
  };

  const extractImageMetadata = async (file: File): Promise<ImageMetadata> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const tags = ExifReader.load(arrayBuffer);

      let dateSpotted = "";
      let location = null;

      if (tags?.DateTimeOriginal?.description) {
        const dateString = tags.DateTimeOriginal.description;
        const [datePart] = dateString.split(" ");
        const [year, month, day] = datePart.split(":");
        dateSpotted = `${year}-${month}-${day}`;
      }

      // Extract GPS coordinates if available
      if (tags?.GPSLatitude?.value && tags?.GPSLongitude?.value) {
        const convertDMSToDD = (dmsArr: any[], ref: string) => {
          try {
            const degrees = dmsArr[0][0] / dmsArr[0][1];
            const minutes = dmsArr[1][0] / dmsArr[1][1];
            const seconds = dmsArr[2][0] / dmsArr[2][1];

            let dd = degrees + minutes / 60 + seconds / 3600;
            if (ref === "S" || ref === "W") dd *= -1;
            return Number(dd.toFixed(6));
          } catch (error) {
            console.warn("Error converting DMS to DD:", error);
            return 0;
          }
        };

        const lat = tags.GPSLatitude?.description
          ? Number(tags.GPSLatitude.description)
          : convertDMSToDD(
              tags.GPSLatitude.value as any[],
              tags.GPSLatitudeRef.value[0]
            );

        const lng = tags.GPSLongitude?.description
          ? Number(tags.GPSLongitude.description)
          : convertDMSToDD(
              tags.GPSLongitude.value as any[],
              tags.GPSLongitudeRef.value[0]
            );

        if (lat && lng) {
          location = { lat, lng };
        }
      }

      return { dateSpotted, location };
    } catch (error) {
      console.warn("Error extracting image metadata:", error);
      return { dateSpotted: "", location: null };
    }
  };

  const handleMetadataExtracted = ({ dateSpotted, location }) => {
    if (dateSpotted) {
      setFormData((prev) => ({
        ...prev,
        date_spotted: dateSpotted,
      }));
    }

    if (location && location.lat !== 0 && location.lng !== 0) {
      setLocation(location);
    }
  };

  const handleSpeciesDetected = (detectedSpecies: string) => {
    setFormData((prev) => ({
      ...prev,
      species_name: detectedSpecies,
    }));
    setSpecies(detectedSpecies);
  };

  useEffect(() => {
    // Process initialFile if provided
    if (initialFile && isOpen) {
      handleImageSelect(initialFile);
    }
  }, [initialFile, isOpen]);

  useEffect(() => {
    if (critter) {
      const formattedDate = critter.date_spotted
        ? new Date(critter.date_spotted).toISOString().split("T")[0]
        : "";

      setFormData({
        ...critter,
        date_spotted: formattedDate,
      });

      setPreview(critter.photo);
      setSpecies(critter.species_name);
      setNotes(critter.notes);

      // Set location state from existing coordinates
      if (critter.latitude && critter.longitude) {
        setLocation({
          lat: parseFloat(critter.latitude),
          lng: parseFloat(critter.longitude),
        });
      }
    } else if (isOpen && !initialFile) {
      // Reset form state when opening for a new critter (but not when initialFile is provided)
      setFormData({
        species_name: "",
        nick_name: "",
        date_spotted: "",
        photo: "",
        notes: "",
        latitude: "",
        longitude: "",
      });
      setImageFile(null);
      setPreview("");
      setLocation(null);
      setShowLocationPicker(false);
      setSpecies("");
      setNotes("");
    }

    // Cleanup function for image preview URL
    return () => {
      if (preview && !critter?.photo) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [critter, isOpen, initialFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Keep species state in sync with form data
    if (name === "species_name") {
      setSpecies(value);
    }

    // Keep notes state in sync with form data
    if (name === "notes") {
      setNotes(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formDataWithImage = new FormData();

      // Update form data with species and notes
      const updatedFormData = {
        ...formData,
        species_name: species,
        notes: notes,
      };

      // Append all form fields except photo and coordinates
      Object.keys(updatedFormData).forEach((key) => {
        if (key !== "photo" && key !== "latitude" && key !== "longitude") {
          formDataWithImage.append(
            key,
            updatedFormData[key as keyof typeof updatedFormData]
          );
        }
      });

      // Handle location data
      let finalLat: string;
      let finalLng: string;

      if (location) {
        finalLat = location.lat.toString();
        finalLng = location.lng.toString();
      } else if (!critter?.id) {
        finalLat = "41.8781";
        finalLng = "87.6298";
      } else {
        finalLat = critter.latitude;
        finalLng = critter.longitude;
      }

      // Ensure we're not sending "0" or empty coordinates
      if (finalLat === "0" || finalLng === "0" || !finalLat || !finalLng) {
        console.log("Coordinates were invalid, using Chicago default");
        finalLat = "41.8781";
        finalLng = "87.6298";
      }

      console.log("Final coordinates being sent:", finalLat, finalLng);
      formDataWithImage.append("latitude", finalLat);
      formDataWithImage.append("longitude", finalLng);

      // Append the image if one was selected
      if (imageFile) {
        formDataWithImage.append("photo", imageFile);
      }

      let savedCritter;
      if (critter?.id) {
        savedCritter = await critterService.update(
          critter.id,
          formDataWithImage
        );
        console.log("Updated critter:", savedCritter);
      } else {
        savedCritter = await critterService.create(formDataWithImage);
        console.log("Created new critter:", savedCritter);
      }

      toast({
        title: critter ? "Critter updated." : "Critter added.",
        description: `The critter was successfully ${
          critter ? "updated" : "added"
        }.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Ensure we're passing the saved critter to the onSave callback
      if (savedCritter) {
        // Create a custom event for the GlobalImageDropZone
        if (!critter?.id) {
          const event = new CustomEvent("critterCreated", {
            detail: savedCritter,
            bubbles: true,
          });
          document.dispatchEvent(event);
        }

        onSave(savedCritter);
      }
      onClose();
    } catch (error) {
      console.error("Error saving critter:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save critter.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="sage.100"
            color="darkGreen.800"
            fontFamily="cursive"
            height="64px"
            px={8}
            display="flex"
            alignItems="center"
          >
            {critter ? "Edit Critter" : "Add New Critter"}
            <ModalCloseButton right={8} />
          </ModalHeader>
          <ModalBody bg="white" p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel
                    color="darkGreen.800"
                    fontWeight="600"
                    fontSize="md"
                  >
                    Photo
                  </FormLabel>
                  <ImageDropzone
                    onImageSelect={handleImageSelect}
                    onMetadataExtracted={handleMetadataExtracted}
                    onSpeciesDetected={handleSpeciesDetected}
                    preview={preview}
                  />
                </FormControl>

                {(isProcessingMetadata || isClassifying) && (
                  <VStack spacing={4} py={2}>
                    {isProcessingMetadata && (
                      <Flex align="center" color="darkGreen.800">
                        <Spinner size="sm" mr={2} color="green.500" />
                        <Text fontSize="sm">Extracting image metadata...</Text>
                      </Flex>
                    )}
                    {isClassifying && (
                      <Flex align="center" color="darkGreen.800">
                        <Spinner size="sm" mr={2} color="green.500" />
                        <Text fontSize="sm">Identifying species...</Text>
                      </Flex>
                    )}
                  </VStack>
                )}

                <FormControl isRequired>
                  <FormLabel
                    htmlFor="species_name"
                    color="darkGreen.800"
                    fontWeight="600"
                    fontSize="md"
                  >
                    Species Name
                  </FormLabel>
                  <Input
                    id="species_name"
                    name="species_name"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    placeholder="Enter species name"
                    bg="cream.50"
                    borderColor="sage.200"
                    _hover={{ borderColor: "sage.300" }}
                    _focus={{
                      borderColor: "green.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
                    }}
                    isDisabled={isClassifying}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    htmlFor="nick_name"
                    color="darkGreen.800"
                    fontWeight="600"
                    fontSize="md"
                  >
                    Nickname (Optional)
                  </FormLabel>
                  <Input
                    id="nick_name"
                    name="nick_name"
                    value={formData.nick_name}
                    onChange={handleChange}
                    placeholder="Give your critter a friendly nickname"
                    bg="cream.50"
                    borderColor="sage.200"
                    _hover={{ borderColor: "sage.300" }}
                    _focus={{
                      borderColor: "green.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel
                    htmlFor="date_spotted"
                    color="darkGreen.800"
                    fontWeight="600"
                    fontSize="md"
                  >
                    Date Spotted
                  </FormLabel>
                  <Input
                    type="date"
                    id="date_spotted"
                    name="date_spotted"
                    value={formData.date_spotted}
                    onChange={handleChange}
                    bg="cream.50"
                    borderColor="sage.200"
                    _hover={{ borderColor: "sage.300" }}
                    _focus={{
                      borderColor: "green.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
                    }}
                    isDisabled={isProcessingMetadata}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    color="darkGreen.800"
                    fontWeight="600"
                    fontSize="md"
                  >
                    Location
                  </FormLabel>
                  <Button
                    onClick={() => setShowLocationPicker(true)}
                    width="full"
                    variant="outline"
                    colorScheme="green"
                    leftIcon={<Icon as={FaMapMarkerAlt} />}
                    bg="cream.50"
                    _hover={{ bg: "sage.50" }}
                  >
                    {location ? "Change Location" : "Set Location"}
                  </Button>
                </FormControl>

                <FormControl>
                  <FormLabel
                    htmlFor="notes"
                    color="darkGreen.800"
                    fontWeight="600"
                    fontSize="md"
                  >
                    Notes (Optional)
                  </FormLabel>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any interesting observations about this critter"
                    bg="cream.50"
                    borderColor="sage.200"
                    _hover={{ borderColor: "sage.300" }}
                    _focus={{
                      borderColor: "green.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
                    }}
                    minH="120px"
                    resize="vertical"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  width="full"
                  size="lg"
                  fontSize="md"
                  height="48px"
                  isLoading={
                    isUploading || isProcessingMetadata || isClassifying
                  }
                  loadingText={
                    isProcessingMetadata
                      ? "Processing metadata..."
                      : isClassifying
                      ? "Identifying species..."
                      : "Saving..."
                  }
                  mt={2}
                  _hover={{ bg: "darkGreen.600" }}
                  _active={{ bg: "darkGreen.700" }}
                >
                  {critter ? "Update Critter" : "Add Critter"}
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        size="xl"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            fontFamily="'Kalam', cursive"
            fontSize="xl"
            color="darkGreen.800"
            borderBottom="1px"
            borderColor="sage.200"
            p={0}
            height="64px"
          >
            <Flex height="100%" alignItems="center" position="relative" px={8}>
              Select Location
              <ModalCloseButton
                position="absolute"
                right={8}
                top="50%"
                transform="translateY(-50%)"
              />
            </Flex>
          </ModalHeader>
          <ModalBody bg="white" p={8}>
            <LocationPicker
              onLocationSelect={(loc) => {
                const newLocation = {
                  lat: loc.lat,
                  lng: Math.abs(loc.lng),
                };
                setLocation(newLocation);
                setShowLocationPicker(false);
              }}
              onClose={() => setShowLocationPicker(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CritterForm;
