import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  Collapse,
} from "@chakra-ui/react";
import { EmailPasswordAuth } from "./EmailPasswordAuth";
import { OAuthButtons } from "./OAuthButtons";

function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const bgColor = useColorModeValue("white", "darkGreen.800");
  const borderColor = useColorModeValue("sage.200", "sage.600");
  const headingColor = useColorModeValue("darkGreen.800", "cream.50");

  const handleAuthError = (message: string) => {
    setError(message);
  };

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
      <CardBody>
        <Collapse in={!!error} animateOpacity>
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Collapse>
        <EmailPasswordAuth onError={handleAuthError} />
        <Divider my={4} borderColor={borderColor} />
        <OAuthButtons />
      </CardBody>
    </Card>
  );
}

export default SignIn;
