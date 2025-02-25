import React from "react";
import SignOut from "../components/Auth/SignOut";
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import NavBar from "@/components/NavBar";
import { CritterList } from "@/components/CritterList";

const Home = () => {
  return (
    <Box w={"100%"} h={"100vh"}>
      <NavBar />
      <CritterList />
    </Box>
  );
};

export default Home;
