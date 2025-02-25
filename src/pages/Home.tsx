import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import NavBar from "@/components/NavBar";
import { CritterList } from "@/components/CritterList";

const Home = () => {
  const bgColor = useColorModeValue("cream.50", "darkGreen.900");

  return (
    <Box w="100%" h="100vh" bg={bgColor}>
      <NavBar />
      <CritterList />
    </Box>
  );
};

export default Home;
