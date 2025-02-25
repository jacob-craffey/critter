import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import { EmailPasswordAuth } from "./EmailPasswordAuth";
import { OAuthButtons } from "./OAuthButtons";

function SignIn() {
  const bgColor = useColorModeValue("white", "darkGreen.800");
  const borderColor = useColorModeValue("sage.200", "sage.600");
  const headingColor = useColorModeValue("darkGreen.800", "cream.50");

  return (
    <Card
      width={320}
      margin="auto"
      variant="elevated"
      bg={bgColor}
      borderColor={borderColor}
      borderWidth="1px"
      boxShadow="lg"
    >
      <CardHeader display="flex" justifyContent="center">
        <Heading size="lg" fontFamily="'Kalam', cursive" color={headingColor}>
          Welcome to Critter
        </Heading>
      </CardHeader>
      <CardBody>
        <EmailPasswordAuth />
        <Divider my={4} borderColor={borderColor} />
        <OAuthButtons />
      </CardBody>
    </Card>
  );
}

export default SignIn;
