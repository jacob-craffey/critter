import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  SimpleGrid,
  SlideFade,
  Spinner,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faThumbTack,
} from "@fortawesome/free-solid-svg-icons";
import CritterForm from "./CritterForm";
import CritterCard from "./CritterCard";
import MapListView from "./MapListView";
import { critterService } from "@/services/CritterService";
import { Critter } from "@/models/types";
import { ClientResponseError } from "pocketbase";
import { pb } from "@/services/pocketbase";

export const CritterList: React.FC = () => {
  const [critters, setCritters] = useState<Critter[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");
  const listRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const perPage = 9;

  // Helper function to get total count of critters
  const getTotalCritterCount = useCallback(async () => {
    try {
      // Use a large page size with page 1 to get total count
      const result = await pb.collection("critters").getList(1, 1, {
        filter: pb.authStore.record?.id
          ? `user_id = "${pb.authStore.record.id}"`
          : "",
      });
      return result.totalItems;
    } catch (error) {
      console.error("Error getting total critter count:", error);
      return 0;
    }
  }, []);

  const fetchCritters = useCallback(async () => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();

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
        console.log("Request was cancelled");
        return;
      }
      console.error("Error fetching critters:", error);
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  // Update pagination when a new critter is added without fetching all critters
  const updatePagination = useCallback(
    (totalItems: number) => {
      const newTotalPages = Math.ceil(totalItems / perPage);
      if (newTotalPages !== totalPages) {
        setTotalPages(newTotalPages);
      }
    },
    [perPage, totalPages]
  );

  useEffect(() => {
    fetchCritters();

    // Cleanup function to abort any pending requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCritters]);

  // Listen for view mode changes from NavBar
  useEffect(() => {
    const handleViewModeChanged = (event: CustomEvent<"cards" | "map">) => {
      const newViewMode = event.detail;
      console.log("View mode changed to:", newViewMode);
      setViewMode(newViewMode);
    };

    // Add event listener
    document.addEventListener(
      "viewModeChanged",
      handleViewModeChanged as EventListener
    );

    // Clean up
    return () => {
      document.removeEventListener(
        "viewModeChanged",
        handleViewModeChanged as EventListener
      );
    };
  }, []);

  // Listen for critter created events from GlobalImageDropZone
  useEffect(() => {
    const handleCritterCreated = (event: CustomEvent<Critter>) => {
      const newCritter = event.detail;
      if (newCritter && newCritter.id) {
        console.log("Critter created event received:", newCritter);
        handleAddOrUpdateCritter(newCritter);

        // If we're not on the first page, go to the first page to see the new critter
        if (page !== 1) {
          setPage(1);
        }
      }
    };

    // Add event listener
    document.addEventListener(
      "critterCreated",
      handleCritterCreated as EventListener
    );

    // Clean up
    return () => {
      document.removeEventListener(
        "critterCreated",
        handleCritterCreated as EventListener
      );
    };
  }, [page]);

  const handleAddOrUpdateCritter = useCallback(
    (updatedCritter: Critter) => {
      // Update the current page view
      setCritters((prevCritters) => {
        const existingCritterIndex = prevCritters.findIndex(
          (critter) => critter.id === updatedCritter.id
        );

        if (existingCritterIndex !== -1) {
          // Update existing critter
          const updatedCritters = [...prevCritters];
          updatedCritters[existingCritterIndex] = updatedCritter;
          return updatedCritters;
        } else if (page === 1) {
          // We're on the first page, so add the new critter at the beginning
          let newCritters = [updatedCritter, ...prevCritters];

          // If we're at max capacity, remove the last item
          if (newCritters.length > perPage) {
            newCritters = newCritters.slice(0, perPage);
          }

          return newCritters;
        } else {
          // We're not on the first page, don't modify the current view
          // The user will need to navigate to page 1 to see the new critter
          return prevCritters;
        }
      });

      // Get the total count to update pagination
      getTotalCritterCount()
        .then((totalCount) => {
          updatePagination(totalCount);
        })
        .catch((error) => {
          console.error("Error getting total count:", error);
        });

      // If we're not on the first page and this is a new critter,
      // navigate to the first page to see it
      if (page !== 1 && !critters.find((c) => c.id === updatedCritter.id)) {
        setPage(1);
      }
    },
    [page, perPage, critters, updatePagination, getTotalCritterCount]
  );

  const handleDeleteCritter = useCallback(
    (critterId: string) => {
      // Update the current view
      setCritters((prevCritters) =>
        prevCritters.filter((critter) => critter.id !== critterId)
      );

      // Get the total count to update pagination
      getTotalCritterCount()
        .then((totalCount) => {
          updatePagination(totalCount);

          // If we deleted the last critter on a page, go back one page
          // (except if we're already on page 1)
          if (critters.length === 1 && page > 1) {
            setPage((prev) => prev - 1);
          }
        })
        .catch((error) => {
          console.error("Error getting total count:", error);
        });
    },
    [critters.length, page, updatePagination, getTotalCritterCount]
  );

  const handleFormClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (loading && critters.length === 0) {
    return (
      <Center h={400}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box ref={listRef}>
      {critters.length === 0 ? (
        <Center flexDirection="column" h="calc(100vh - 64px)" px={4}>
          <Box mb={8} textAlign="center" maxW="600px">
            <Text
              fontSize="3xl"
              fontFamily="'Kalam', cursive"
              color="sage.600"
              mb={4}
            >
              Welcome to Critter!
            </Text>
            <Text fontSize="lg" color="gray.600" mb={8}>
              Document and share your wildlife encounters. Start your collection
              by dropping an image anywhere on the screen or using the camera
              button.
            </Text>
            <Flex justifyContent="center" alignItems="center">
              <FontAwesomeIcon icon={faThumbTack} size="lg" color="#38A169" />
              <Text ml={2} color="gray.600">
                Drag & drop an image or use the camera button in the bottom
                right
              </Text>
            </Flex>
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
              <SlideFade in={true} offsetY="40px" key={critter.id}>
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
        onClose={handleFormClose}
        onSave={handleAddOrUpdateCritter}
      />
    </Box>
  );
};
