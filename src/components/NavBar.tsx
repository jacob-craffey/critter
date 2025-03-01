import React, { useState } from "react";
import {
  Box,
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  IconButton,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap, faThLarge } from "@fortawesome/free-solid-svg-icons";
import { pb } from "@/services/pocketbase";

// Create a custom event for view mode changes
export const setViewModeEvent = (viewMode: "cards" | "map") => {
  const event = new CustomEvent("viewModeChanged", {
    detail: viewMode,
  });
  document.dispatchEvent(event);
};

const NavBar: React.FC = () => {
  const user = pb.authStore.record;
  const bgColor = useColorModeValue("sage.300", "darkGreen.800");
  const textColor = useColorModeValue("darkGreen.800", "cream.50");
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");

  const handleViewModeChange = (mode: "cards" | "map") => {
    setViewMode(mode);
    setViewModeEvent(mode);
  };

  return (
    <Box bg={bgColor} py={3} px={6} boxShadow="lg">
      <Flex h={12} alignItems="center" justifyContent="space-between">
        <Box
          fontFamily="'Kalam', cursive"
          fontSize="2xl"
          fontWeight="bold"
          color={textColor}
        >
          Critter
        </Box>
        <Flex alignItems="center" gap={4}>
          <HStack
            spacing={0}
            bg="white"
            borderRadius="full"
            overflow="hidden"
            boxShadow="sm"
            border="1px"
            borderColor="sage.200"
          >
            <Tooltip label="Card View" placement="bottom">
              <IconButton
                aria-label="Card view"
                icon={<FontAwesomeIcon icon={faThLarge} />}
                onClick={() => handleViewModeChange("cards")}
                variant="ghost"
                colorScheme="green"
                size="md"
                borderRadius="full"
                bg={viewMode === "cards" ? "green.100" : "transparent"}
                color={viewMode === "cards" ? "green.700" : "gray.500"}
                _hover={{ bg: viewMode === "cards" ? "green.100" : "gray.100" }}
                borderRight="1px"
                borderColor="sage.200"
              />
            </Tooltip>
            <Tooltip label="Map View" placement="bottom">
              <IconButton
                aria-label="Map view"
                icon={<FontAwesomeIcon icon={faMap} />}
                onClick={() => handleViewModeChange("map")}
                variant="ghost"
                colorScheme="green"
                size="md"
                borderRadius="full"
                bg={viewMode === "map" ? "green.100" : "transparent"}
                color={viewMode === "map" ? "green.700" : "gray.500"}
                _hover={{ bg: viewMode === "map" ? "green.100" : "gray.100" }}
              />
            </Tooltip>
          </HStack>
          <Menu>
            <MenuButton>
              <Avatar
                size="sm"
                src={""}
                name={user?.name || user?.email}
                bg="sage.400"
                color="white"
                cursor="pointer"
                _hover={{ opacity: 0.8 }}
              />
            </MenuButton>
            <MenuList bg="white" borderColor="sage.200">
              <MenuItem
                color="darkGreen.800"
                _hover={{ bg: "cream.50" }}
                onClick={() => {
                  pb.authStore.clear();
                  window.location.href = "/";
                }}
              >
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default NavBar;
