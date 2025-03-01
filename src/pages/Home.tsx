import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import NavBar from "@/components/NavBar";
import { CritterList } from "@/components/CritterList";

const Home = () => {
  const bgColor = useColorModeValue("cream.50", "darkGreen.900");

  return (
    <Box
      w="100%"
      minH="100vh"
      bg={bgColor}
      display="flex"
      flexDirection="column"
      position="relative"
      overflow="hidden"
    >
      <NavBar />
      <Box flex="1" position="relative">
        <CritterList />
      </Box>
    </Box>
  );
};

export default Home;
