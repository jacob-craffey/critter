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
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faMap,
  faThLarge,
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
      <Flex justifyContent="space-between" p={4}>
        <Flex gap={2}>
          <IconButton
            aria-label="Toggle view"
            icon={
              <FontAwesomeIcon
                icon={viewMode === "cards" ? faMap : faThLarge}
              />
            }
            onClick={() => setViewMode(viewMode === "cards" ? "map" : "cards")}
          />
        </Flex>
        <Button onClick={onOpen} colorScheme="blue">
          Add New Critter
        </Button>
      </Flex>

      {viewMode === "cards" ? (
        <>
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
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
          <Flex justifyContent="center" mt={6} gap={6}>
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              isDisabled={page === 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>
            <Button
              onClick={() => setPage((p) => p + 1)}
              isDisabled={page >= totalPages}
            >
              <FontAwesomeIcon icon={faChevronRight} />
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
