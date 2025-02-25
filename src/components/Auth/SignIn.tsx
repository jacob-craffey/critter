import React from "react";
import { Card, CardBody, CardHeader, Divider, Heading } from "@chakra-ui/react";
import { EmailPasswordAuth } from "./EmailPasswordAuth";
import { OAuthButtons } from "./OAuthButtons";

function SignIn() {
  return (
    <Card width={320} margin="auto" variant={"elevated"}>
      <CardHeader display="flex" justifyContent="center">
        <Heading size="md">Welcome to Critter</Heading>
      </CardHeader>
      <CardBody>
        <EmailPasswordAuth />
        <Divider my={4} />
        <OAuthButtons />
      </CardBody>
    </Card>
  );
}

export default SignIn;
