import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    cream: {
      50: "#FFFBF5",
      100: "#F5E6D3",
    },
    sage: {
      100: "#E8EEEA",
      200: "#D1DBD4",
      300: "#B4C4B9",
      400: "#96AA9C",
      500: "#798C7F",
      600: "#5F705F",
      700: "#465446",
    },
    darkGreen: {
      700: "#2C4A2C",
      800: "#1E321E",
      900: "#152315",
    },
  },
  fonts: {
    heading: "'Kalam', cursive",
    body: "system-ui, sans-serif",
  },
});

export default theme;
