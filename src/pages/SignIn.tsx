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
          Your personal wildlife journal for documenting and sharing nature
          encounters
        </Text>
        <Card
          width={380}
          bg={bgColor}
          borderColor={borderColor}
          borderWidth="1px"
          boxShadow="lg"
          borderRadius="xl"
        >
          <CardHeader pb={2}>
            <Heading
              size="md"
              color={textColor}
              textAlign="center"
              fontWeight="medium"
            >
              Sign In to Your Account
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              <EmailPasswordAuth />
              <Divider borderColor={borderColor} />
              <OAuthButtons />
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </AuthBackground>
  );
};

export default SignIn;
