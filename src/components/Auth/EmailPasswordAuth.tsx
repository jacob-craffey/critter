import React, { useState } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
} from "@chakra-ui/react";
import { authService } from "@/services/AuthService";
import { pb } from "@/services/pocketbase";
import { ClientResponseError } from "pocketbase";

interface EmailPasswordAuthProps {
  onError: (message: string) => void;
}

export const EmailPasswordAuth: React.FC<EmailPasswordAuthProps> = ({
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await pb.collection("users").authWithPassword(email, password);
      await authService.signIn({ email, password });
    } catch (error) {
      if (error instanceof ClientResponseError) {
        if (error.status === 400) {
          onError("Invalid email or password");
        } else {
          onError("An error occurred while signing in");
        }
      }
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Authentication failed",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await authService.signUp({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        passwordConfirm: formData.get("passwordConfirm") as string,
      });

      toast({
        title: "Account created",
        description: "You have been successfully signed up and logged in",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Registration failed",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs isFitted variant="enclosed">
      <TabList mb="1em">
        <Tab>Sign In</Tab>
        <Tab>Sign Up</Tab>
      </TabList>
      <TabPanels>
        <TabPanel p={0}>
          <form onSubmit={handleSignIn}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </VStack>
          </form>
        </TabPanel>
        <TabPanel p={0}>
          <form onSubmit={handleSignUp}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input name="password" type="password" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input name="passwordConfirm" type="password" />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={isLoading}
              >
                Sign Up
              </Button>
            </VStack>
          </form>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
