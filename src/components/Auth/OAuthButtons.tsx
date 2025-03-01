import React, { useState } from "react";
import { authService } from "@/services/AuthService";
import { Box, Button, VStack, Icon, Text, Flex } from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";

export const OAuthButtons = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthLogin = async (provider: string) => {
    try {
      setIsLoading(true);
      setError("");
      await authService.signInWithOAuth(provider);
    } catch (error) {
      console.error("OAuth error:", error);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <VStack flex={100} spacing={4}>
        <Button
          onClick={() => handleOAuthLogin("google")}
          variant="outline"
          w="full"
          colorScheme="green"
          height="48px"
          fontSize="md"
          isLoading={isLoading}
          leftIcon={<Icon as={FaGoogle} color="#4285F4" boxSize={5} />}
          justifyContent="flex-start"
          px={4}
        >
          <Text flex="1" textAlign="center">
            Continue with Google
          </Text>
        </Button>

        {/* <Button
          onClick={() => handleOAuthLogin("apple")}
          variant="outline"
          w={"full"}
        >
          Continue with Apple
        </Button> */}
      </VStack>
    </Box>
  );
};
