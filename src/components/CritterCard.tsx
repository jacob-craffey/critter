import { Critter } from "@/models/types";
import {
  Card,
  CardBody,
  VStack,
  Heading,
  Image,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
  useToast,
  Center,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsis,
  faPencil,
  faThumbTack,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import CritterForm from "./CritterForm";
import { critterService } from "@/services/CritterService";
import { AlertDialog } from "./AlertDialog";
import { pb } from "@/services/pocketbase";
import CritterDetail from "./CritterDetail";

interface CritterCardProps {
  critter: Critter;
  onDelete: (critterId: string) => void;
  onUpdate: (updatedCritter: Critter) => void;
}

function CritterCard({ critter, onDelete, onUpdate }: CritterCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const handleDelete = async () => {
    try {
      await critterService.delete(critter.id);
      toast({
        title: "Critter deleted.",
        description: "The critter was successfully deleted.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setIsAlertOpen(false);
      onDelete(critter.id);
    } catch (error) {
      console.error("Error deleting critter:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete critter.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getImageUrl = (record: any) => {
    return pb.files.getURL(record, record.photo, { thumb: "260x0" });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const bgColor = useColorModeValue("white", "darkGreen.800");
  const borderColor = useColorModeValue("sage.200", "sage.600");
  const textColor = useColorModeValue("darkGreen.800", "cream.50");

  return (
    <>
      <Card
        key={critter.id}
        w="300px"
        bg={bgColor}
        borderColor={borderColor}
        borderWidth="1px"
        boxShadow="lg"
        borderRadius="md"
        overflow="hidden"
        onClick={() => setIsDetailOpen(true)}
        cursor="pointer"
        _hover={{
          transform: "translateY(-4px)",
          transition: "transform 0.2s",
        }}
      >
        <CardBody p={0}>
          <Menu>
            <MenuButton
              as={Button}
              position="absolute"
              right={0}
              top={0}
              borderRadius="50%"
              p={0}
              zIndex={2}
              bg="white"
              _hover={{ opacity: 1 }}
              onClick={handleMenuClick}
            >
              <Box
                transform="rotate(45deg) perspective(100px) rotateX(30deg)"
                style={{ transformOrigin: "center" }}
              >
                <FontAwesomeIcon
                  icon={faThumbTack}
                  style={{ color: "#E53E3E" }}
                  size="2xl"
                />
              </Box>
            </MenuButton>
            <MenuList minW="fit-content" onClick={handleMenuClick}>
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
              >
                <FontAwesomeIcon
                  icon={faPencil}
                  style={{ marginRight: "10px" }}
                />
                Edit
              </MenuItem>
              <MenuItem
                color="red.500"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAlertOpen(true);
                }}
              >
                <FontAwesomeIcon
                  icon={faTrash}
                  style={{ marginRight: "10px" }}
                />
                Delete
              </MenuItem>
            </MenuList>
          </Menu>

          <Box
            position="relative"
            bg="gray.100"
            borderRadius="sm"
            overflow="hidden"
            mb={4}
          >
            <Image
              src={critter.photo ? getImageUrl(critter) : ""}
              alt={critter.species_name}
              h="260px"
              w="100%"
              objectFit="cover"
              fallback={
                <Center h="260px" bg="gray.100">
                  <Text color="gray.500">No image available</Text>
                </Center>
              }
            />
          </Box>

          <VStack
            spacing={1}
            align="start"
            px={4}
            pb={4}
            fontFamily="'Kalam', cursive"
          >
            <Heading size="md" fontFamily="inherit" color={textColor}>
              {critter.nick_name || critter.species_name}
            </Heading>
            {critter.nick_name && (
              <Text fontSize="sm" color="sage.500">
                {critter.species_name}
              </Text>
            )}
            <Text fontSize="sm" color="sage.400">
              {new Date(critter.date_spotted).toLocaleDateString()}
            </Text>
            {critter.notes && (
              <Text noOfLines={2} fontSize="sm" color="sage.500">
                {critter.notes}
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>

      <CritterDetail
        critter={critter}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <CritterForm
        critter={critter}
        isOpen={isOpen}
        onClose={onClose}
        onSave={onUpdate}
      />

      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={handleDelete}
        cancelRef={cancelRef}
        title="Delete Critter"
        description="Are you sure you want to delete this critter? This action cannot be undone."
        confirmText="Delete"
        confirmColorScheme="red"
      />
    </>
  );
}

export default CritterCard;
