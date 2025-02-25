import React, { useState, useEffect, useCallback } from "react";
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
} from "@chakra-ui/react";
import { critterService } from "@/services/CritterService";
import { Critter } from "@/models/types";
import { ImageDropzone } from "./ImageDropZone";
import { LocationPicker } from "./LocationPicker";

interface CritterFormProps {
  critter?: Critter;
  isOpen: boolean;
  onClose: () => void;
  onSave: (critter: Critter) => void;
}

const CritterForm: React.FC<CritterFormProps> = ({
  critter,
  isOpen,
  onClose,
  onSave,
}) => {
  const toast = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [formData, setFormData] = useState<Omit<Critter, "user_id">>({
    species_name: "",
    nick_name: "", // Add this line
    date_spotted: "",
    photo: "",
    notes: "",
  });

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleMetadataExtracted = ({ dateSpotted, location }) => {
    if (dateSpotted) {
      setFormData((prev) => ({
        ...prev,
        date_spotted: dateSpotted,
      }));
    }
    if (location) {
      setLocation(location);
    } else {
      setShowLocationPicker(true);
    }
  };

  useEffect(() => {
    if (critter) {
      const formattedDate = critter.date_spotted
        ? new Date(critter.date_spotted).toISOString().split("T")[0]
        : "";

      setFormData({
        ...critter,
        date_spotted: formattedDate,
      });

      setImagePreview(critter.photo);
    }

    // Cleanup function for image preview URL
    return () => {
      if (imagePreview && !critter?.photo) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [critter]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formDataWithImage = new FormData();

      // Append all form fields except photo
      Object.keys(formData).forEach((key) => {
        if (key !== "photo") {
          formDataWithImage.append(key, formData[key as keyof typeof formData]);
        }
      });

      // Append location data if available
      if (location) {
        formDataWithImage.append("latitude", location.lat.toString());
        formDataWithImage.append("longitude", location.lng.toString());
      }

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
      } else {
        savedCritter = await critterService.create(formDataWithImage);
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

      onSave(savedCritter);
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {critter ? "Edit Critter" : "Add New Critter"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel htmlFor="species_name">Species Name</FormLabel>
                  <Input
                    id="species_name"
                    name="species_name"
                    value={formData.species_name}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="nick_name">Nickname</FormLabel>
                  <Input
                    id="nick_name"
                    name="nick_name"
                    value={formData.nick_name || ""}
                    onChange={handleChange}
                    placeholder="Optional nickname for this critter"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Photo</FormLabel>
                  <ImageDropzone
                    onImageSelect={handleImageSelect}
                    onMetadataExtracted={handleMetadataExtracted}
                    preview={imagePreview}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="date_spotted">Date Spotted</FormLabel>
                  <Input
                    type="date"
                    id="date_spotted"
                    name="date_spotted"
                    value={formData.date_spotted}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="notes">Notes</FormLabel>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={isUploading}
                  loadingText="Saving..."
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
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Location</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <LocationPicker
              onLocationSelect={(loc) => {
                setLocation(loc);
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
