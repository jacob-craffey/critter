import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Center,
  Flex,
  SimpleGrid,
  SlideFade,
  Spinner,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbTack } from "@fortawesome/free-solid-svg-icons";
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
  const [hasMore, setHasMore] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");
  const listRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
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

  const fetchCritters = useCallback(
    async (pageToFetch: number, append: boolean = false) => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        const { items, totalPages } = await critterService.getList(
          pageToFetch,
          perPage
        );

        if (append) {
          setCritters((prev) => [...prev, ...items]);
        } else {
          setCritters(items);
        }

        // Check if we've reached the end
        setHasMore(pageToFetch < totalPages);
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
    },
    [perPage]
  );

  // Load more critters when scrolling
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCritters(nextPage, true);
    }
  }, [loading, hasMore, page, fetchCritters]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (loadingRef.current && viewMode === "cards") {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, viewMode]);

  // Initial fetch
  useEffect(() => {
    fetchCritters(1, false);

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
  }, []);

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
        } else {
          // Add new critter at the beginning
          return [updatedCritter, ...prevCritters];
        }
      });

      // Reset to page 1 and refresh the list when a new critter is added
      if (page !== 1) {
        setPage(1);
        fetchCritters(1, false);
      }

      // Update hasMore based on total count
      getTotalCritterCount()
        .then((totalCount) => {
          setHasMore(totalCount > critters.length);
        })
        .catch((error) => {
          console.error("Error getting total count:", error);
        });
    },
    [page, critters.length, fetchCritters, getTotalCritterCount]
  );

  const handleDeleteCritter = useCallback(
    (critterId: string) => {
      // Update the current view
      setCritters((prevCritters) =>
        prevCritters.filter((critter) => critter.id !== critterId)
      );

      // Update hasMore based on new total count
      getTotalCritterCount()
        .then((totalCount) => {
          setHasMore(totalCount > critters.length - 1);

          // If we deleted the last visible critter and there are more to load, fetch more
          if (critters.length <= 1 && totalCount > 0) {
            fetchCritters(1, false);
          }
        })
        .catch((error) => {
          console.error("Error getting total count:", error);
        });
    },
    [critters.length, fetchCritters, getTotalCritterCount]
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

          {/* Infinite scroll loading indicator */}
          {viewMode === "cards" && (
            <Center py={6} ref={loadingRef}>
              {loading && hasMore ? (
                <Spinner size="md" color="green.500" />
              ) : hasMore ? (
                <Text color="gray.500" fontSize="sm">
                  Scroll for more
                </Text>
              ) : critters.length > 0 ? (
                <Text color="gray.500" fontSize="sm">
                  No more critters to load
                </Text>
              ) : null}
            </Center>
          )}
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
