import { pb } from "./pocketbase";
import { AuthCredentials, SignUpData } from "@/models/types";

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signIn({ email, password }: AuthCredentials) {
    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      return authData;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  async signUp({ email, password, passwordConfirm }: SignUpData) {
    try {
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm,
      });

      // Auto sign in after successful registration
      return this.signIn({ email, password });
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  async signInWithOAuth(provider: string) {
    try {
      const authData = await pb.collection("users").authWithOAuth2({
        provider,
        createData: {
          nameVisibility: false,
        },
      });
      return authData;
    } catch (error) {
      console.error("OAuth error:", error);
      throw error;
    }
  }

  signOut() {
    pb.authStore.clear();
  }

  isAuthenticated(): boolean {
    return pb.authStore.isValid;
  }

  getCurrentUserId(): string | null {
    return pb.authStore.record?.id || null;
  }

  onAuthStateChange(callback: (isAuthenticated: boolean) => void) {
    pb.authStore.onChange((auth) => {
      callback(!!auth);
    });
  }
}

export const authService = AuthService.getInstance();
