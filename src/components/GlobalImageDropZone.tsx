import React, { useState, useCallback, useEffect } from "react";
import { Box, useDisclosure, Button, Icon, Text } from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { FaCamera } from "react-icons/fa";
import CritterForm from "./CritterForm";
import { Critter } from "@/models/types";
import { critterService } from "@/services/CritterService";

interface GlobalImageDropZoneProps {
  children: React.ReactNode;
}

// Create a custom event for critter updates
export const createCritterEvent = new CustomEvent<Critter>("critterCreated", {
  detail: null as unknown as Critter,
  bubbles: true,
});

const GlobalImageDropZone: React.FC<GlobalImageDropZoneProps> = ({
  children,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        onOpen();
      }
      setIsDragging(false);
    },
    [onOpen]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const handleAddCritterClick = () => {
    open();
  };

  const handleSave = useCallback(
    (critter: Critter) => {
      // Dispatch a custom event with the new critter data
      const event = new CustomEvent("critterCreated", {
        detail: critter,
        bubbles: true,
      });
      document.dispatchEvent(event);

      setSelectedFile(null);
      onClose();
    },
    [onClose]
  );

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    onClose();
  }, [onClose]);

  return (
    <Box
      {...getRootProps()}
      position="relative"
      width="100%"
      height="100%"
      minH="100vh"
    >
      <input {...getInputProps()} />

      {/* Floating add button */}
      <Button
        position="fixed"
        bottom="24px"
        right="24px"
        size="lg"
        colorScheme="green"
        borderRadius="full"
        width="60px"
        height="60px"
        boxShadow="0 4px 12px rgba(0,0,0,0.15)"
        onClick={handleAddCritterClick}
        zIndex={100}
        _hover={{ transform: "scale(1.05)" }}
        _active={{ transform: "scale(0.95)" }}
        transition="all 0.2s"
      >
        <Icon as={FaCamera} fontSize="24px" />
      </Button>

      {/* Drag overlay */}
      {isDragging && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(74, 85, 104, 0.7)"
          backdropFilter="blur(4px)"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          <Box
            bg="white"
            p={8}
            borderRadius="lg"
            textAlign="center"
            boxShadow="xl"
            maxW="400px"
            w="90%"
          >
            <Icon as={FaCamera} fontSize="48px" color="green.500" mb={4} />
            <Text fontSize="xl" fontWeight="bold" color="darkGreen.800">
              Drop your image to add a new critter
            </Text>
            <Text color="gray.600" mt={2}>
              We'll extract location and help identify the species
            </Text>
          </Box>
        </Box>
      )}

      {/* Main content */}
      {children}

      {/* Critter form modal */}
      {selectedFile && (
        <CritterForm
          isOpen={isOpen}
          onClose={handleClose}
          onSave={handleSave}
          initialFile={selectedFile}
        />
      )}
    </Box>
  );
};

export default GlobalImageDropZone;
