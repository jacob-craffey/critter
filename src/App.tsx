import { Box } from "@chakra-ui/react";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import { authService } from "@/services/AuthService";
import { useEffect, useState } from "react";
import GlobalImageDropZone from "./components/GlobalImageDropZone";

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
    <Box>
      {isAuthenticated ? (
        <GlobalImageDropZone>
          <Home />
        </GlobalImageDropZone>
      ) : (
        <SignIn />
      )}
    </Box>
  );
}

export default App;
