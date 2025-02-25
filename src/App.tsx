import "leaflet/dist/leaflet.css";
import { Box } from "@chakra-ui/react";
import SignIn from "./components/Auth/SignIn";
import Home from "./pages/Home";
import { authService } from "@/services/AuthService";
import { useEffect, useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );

  useEffect(() => {
    authService.onAuthStateChange((auth) => {
      setIsAuthenticated(auth);
    });
  }, []);

  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignContent={"center"}
      h={"100vh"}
      bg="#F5E6D3" // Soft modern cork color
    >
      {isAuthenticated ? <Home /> : <SignIn />}
    </Box>
  );
}

export default App;
