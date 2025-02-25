import { authService } from "@/services/AuthService";
import { Button } from "@chakra-ui/react";

export default function SignOut() {
  return <Button onClick={() => authService.signOut()}>Sign Out</Button>;
}
