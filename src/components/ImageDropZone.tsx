import React, { useState } from "react";
import { Box, Center, Image, Text, VStack, Spinner } from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import ExifReader from "exifreader";
import MapView from "./MapView";
import { pb } from "@/services/pocketbase";
import { ImageMetadata } from "@/models/types";
import { imageClassificationService } from "@/services/ImageClassificationService";

interface ImageDropzoneProps {
  onImageSelect: (file: File) => void;
  onMetadataExtracted: (metadata: ImageMetadata) => void;
  onSpeciesDetected?: (species: string) => void;
  preview?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageSelect,
  onMetadataExtracted,
  onSpeciesDetected,
  preview,
}) => {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  // Add function to handle preview URL
  const getPreviewUrl = (previewPath: string) => {
    // Check if the preview is a blob URL (from new file upload)
    if (previewPath.startsWith("blob:")) {
      return previewPath;
    }
    // Check if it's a full URL already
    if (previewPath.startsWith("http")) {
      return previewPath;
    }
    // Otherwise, assume it's a PocketBase file and get the thumbnail URL
    return pb.files.getURL(pb.collection("critters"), previewPath, {
      thumb: "200x0",
    });
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
        const convertDMSToDD = (dmsArr: [number, number][], ref: string) => {
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
              tags.GPSLatitude.value,
              tags.GPSLatitudeRef.value[0]
            );

        const lng = tags.GPSLongitude?.description
          ? Number(tags.GPSLongitude.description)
          : convertDMSToDD(
              tags.GPSLongitude.value,
              tags.GPSLongitudeRef.value[0]
            );

        if (lat && lng) {
          location = { lat, lng };
          setCurrentLocation(location);
        }
      }

      return { dateSpotted, location };
    } catch (error) {
      console.warn("Error extracting image metadata:", error);
      return { dateSpotted: "", location: null };
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageSelect(file);
      const metadata = await extractImageMetadata(file);
      onMetadataExtracted(metadata);

      // Classify the image
      setIsClassifying(true);
      try {
        const species = await imageClassificationService.classifyImage(file);
        if (species && onSpeciesDetected) {
          onSpeciesDetected(species);
        }
      } catch (error) {
        console.error("Error classifying image:", error);
      } finally {
        setIsClassifying(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <VStack spacing={4} width="100%">
      <Box
        {...getRootProps()}
        borderWidth={2}
        borderStyle="dashed"
        borderRadius="md"
        p={4}
        cursor="pointer"
        bg={isDragActive ? "gray.50" : "white"}
        _hover={{ bg: "gray.50" }}
        width="100%"
        position="relative"
      >
        <input {...getInputProps()} />
        {preview ? (
          <Center>
            <Image
              src={getPreviewUrl(preview)}
              alt="Preview"
              maxH="200px"
              objectFit="contain"
            />
            {isClassifying && (
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="blackAlpha.50"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="md"
              >
                <VStack>
                  <Spinner size="md" color="green.500" />
                  <Text fontSize="sm" color="darkGreen.800">
                    Identifying species...
                  </Text>
                </VStack>
              </Box>
            )}
          </Center>
        ) : (
          <Center>
            <Text color="gray.500">
              {isDragActive
                ? "Drop the image here"
                : "Drag and drop an image here, or click to select"}
            </Text>
          </Center>
        )}
      </Box>

      {currentLocation && (
        <MapView lat={currentLocation.lat} lng={currentLocation.lng} />
      )}
    </VStack>
  );
};
