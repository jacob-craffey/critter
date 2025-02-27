import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  SimpleGrid,
  SlideFade,
  Spinner,
  useDisclosure,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faMap,
  faThLarge,
  faThumbTack,
} from "@fortawesome/free-solid-svg-icons";
import CritterForm from "./CritterForm";
import CritterCard from "./CritterCard";
import MapListView from "./MapListView";
import { critterService } from "@/services/CritterService";
import { Critter } from "@/models/types";
import { ClientResponseError } from "pocketbase";

export const CritterList: React.FC = () => {
  const [critters, setCritters] = useState<Critter[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");

  const perPage = 10;

  const fetchCritters = async () => {
    try {
      setLoading(true);
      const { items, totalPages: total } = await critterService.getList(
        page,
        perPage
      );
      setCritters(items);
      setTotalPages(total);
    } catch (error) {
      if (error instanceof ClientResponseError && error.isAbort) {
        // Ignore auto-cancelled requests
        return;
      }
      console.error("Error fetching critters:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCritters();
  }, [page]);

  const handleAddOrUpdateCritter = (updatedCritter: Critter) => {
    setCritters((prevCritters) => {
      const existingCritterIndex = prevCritters.findIndex(
        (critter) => critter.id === updatedCritter.id
      );
      if (existingCritterIndex !== -1) {
        // Update existing critter
        const updatedCritters = [...prevCritters];
        updatedCritters[existingCritterIndex] = updatedCritter;
        return updatedCritters;
      } else {
        // Add new critter
        return [updatedCritter, ...prevCritters];
      }
    });
  };

  const handleDeleteCritter = (critterId: string) => {
    setCritters((prevCritters) =>
      prevCritters.filter((critter) => critter.id !== critterId)
    );
  };

  if (loading) {
    return (
      <Center h={400}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      {critters.length > 0 && (
        <Flex
          justifyContent="space-between"
          p={6}
          bg="cream.50"
          borderBottom="1px"
          borderColor="sage.200"
          position="sticky"
          top={0}
          zIndex={2}
        >
          <Flex gap={2} align="center">
            <IconButton
              aria-label="Toggle view"
              icon={
                <FontAwesomeIcon
                  icon={viewMode === "cards" ? faMap : faThLarge}
                  size="lg"
                />
              }
              onClick={() =>
                setViewMode(viewMode === "cards" ? "map" : "cards")
              }
              variant="ghost"
              colorScheme="green"
              size="lg"
            />
            <Text
              fontSize="md"
              fontFamily="'Kalam', cursive"
              color="darkGreen.800"
              ml={2}
            >
              {viewMode === "cards" ? "Card View" : "Map View"}
            </Text>
          </Flex>
          <Button
            onClick={onOpen}
            colorScheme="green"
            size="lg"
            fontSize="md"
            leftIcon={<FontAwesomeIcon icon={faThumbTack} />}
          >
            Add New Critter
          </Button>
        </Flex>
      )}

      {critters.length === 0 ? (
        <Center flexDirection="column" h="calc(100vh - 64px)" px={4}>
          <Box mb={8} textAlign="center" maxW="600px">
            <Text
              fontSize="2xl"
              fontFamily="'Kalam', cursive"
              color="sage.600"
              mb={4}
            >
              Welcome to Critter!
            </Text>
            <Text fontSize="md" color="gray.600" mb={8}>
              Document and share your wildlife encounters. Start your collection
              by adding your first critter sighting.
            </Text>
            <Button
              onClick={onOpen}
              colorScheme="green"
              size="lg"
              fontSize="md"
              leftIcon={<FontAwesomeIcon icon={faThumbTack} />}
              px={8}
              py={6}
            >
              Add Your First Critter
            </Button>
          </Box>
        </Center>
      ) : viewMode === "cards" ? (
        <>
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
            p={6}
            justifyItems="center"
            maxW="1200px"
            mx="auto"
          >
            {critters.map((critter) => (
              <SlideFade in={!loading} offsetY="40px" key={critter.id}>
                <CritterCard
                  critter={critter}
                  onDelete={handleDeleteCritter}
                  onUpdate={handleAddOrUpdateCritter}
                />
              </SlideFade>
            ))}
          </SimpleGrid>
          <Flex justifyContent="center" mt={6} mb={8} gap={4}>
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              isDisabled={page === 1}
              colorScheme="green"
              variant="outline"
              fontSize="md"
              leftIcon={<FontAwesomeIcon icon={faChevronLeft} />}
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((p) => p + 1)}
              isDisabled={page >= totalPages}
              colorScheme="green"
              variant="outline"
              fontSize="md"
              rightIcon={<FontAwesomeIcon icon={faChevronRight} />}
            >
              Next
            </Button>
          </Flex>
        </>
      ) : (
        <MapListView critters={critters} />
      )}

      <CritterForm
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleAddOrUpdateCritter}
      />
    </Box>
  );
};
