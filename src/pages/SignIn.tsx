import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { EmailPasswordAuth } from "@/components/Auth/EmailPasswordAuth";
import { OAuthButtons } from "@/components/Auth/OAuthButtons";
import AuthBackground from "@/components/Auth/AuthBackground";
import SignInCard from "@/components/Auth/SignInCard";

const SignIn = () => {
  const bgColor = useColorModeValue("white", "darkGreen.800");
  const borderColor = useColorModeValue("sage.200", "sage.600");
  const textColor = useColorModeValue("darkGreen.800", "cream.50");

  return (
    <AuthBackground>
      <VStack spacing={8}>
        <Heading
          size="2xl"
          color="darkGreen.800"
          fontFamily="'Kalam', cursive"
          textAlign="center"
        >
          Critter
        </Heading>
        <Text
          fontSize="lg"
          color="sage.600"
          maxW="400px"
          textAlign="center"
          mb={4}
        >
          Your personal wildlife journal for documenting nature encounters
        </Text>
        <SignInCard />
      </VStack>
    </AuthBackground>
  );
};

export default SignIn;
