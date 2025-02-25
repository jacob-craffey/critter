import React, { useState } from "react";
import { authService } from "@/services/AuthService";
import { Box, Button, VStack } from "@chakra-ui/react";

export const OAuthButtons = () => {
  const [error, setError] = useState("");

  const handleOAuthLogin = async (provider: string) => {
    try {
      setError("");
      await authService.signInWithOAuth(provider);
    } catch (error) {
      console.error("OAuth error:", error);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
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
          variant={"outline"}
          w={"full"}
        >
          Continue with Google
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
