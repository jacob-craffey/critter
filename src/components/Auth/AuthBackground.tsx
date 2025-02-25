import { Box } from "@chakra-ui/react";
import React from "react";

const AuthBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      h="100vh"
      w="100vw"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="cream.50"
    >
      {/* Nature-inspired decorative elements */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="radial(circle at 30% 30%, sage.200 0%, transparent 70%)"
        opacity={0.4}
        zIndex={0}
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="radial(circle at 70% 70%, darkGreen.700 0%, transparent 70%)"
        opacity={0.2}
        zIndex={0}
      />

      {/* Content */}
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Box>
  );
};

export default AuthBackground;
