import React from "react";
import {
  Box,
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { pb } from "@/services/pocketbase";

const NavBar: React.FC = () => {
  const user = pb.authStore.record;
  const bgColor = useColorModeValue("sage.300", "darkGreen.800");
  const textColor = useColorModeValue("darkGreen.800", "cream.50");

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
        <Flex alignItems="center">
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
