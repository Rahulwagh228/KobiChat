/**
 * Auth Service
 * Handles authentication API calls and token management
 */

interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

interface KobiAuth {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

class AuthService {
  private apiBase: string;
  private signupEndpoint: string;
  private loginEndpoint: string;

  constructor() {
    this.apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
    this.signupEndpoint =
      process.env.NEXT_PUBLIC_SIGNUP_ENDPOINT || "/auth/register";
    this.loginEndpoint =
      process.env.NEXT_PUBLIC_LOGIN_ENDPOINT || "/auth/login";
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBase}${this.loginEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBase}${this.signupEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  storeToken(token: string, user?: { id: string; username: string; email: string }): void {
    if (typeof window !== "undefined") {
      const kobiAuth: KobiAuth = {
        token,
        user: user || { id: "", username: "", email: "" },
      };
      localStorage.setItem("Kobi", JSON.stringify(kobiAuth));
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      try {
        const kobiData = localStorage.getItem("Kobi");
        if (kobiData) {
          const parsed: KobiAuth = JSON.parse(kobiData);
          return parsed.token || null;
        }
      } catch (error) {
        console.error("Error parsing Kobi auth data:", error);
      }
    }
    return null;
  }

  getUser(): { id: string; username: string; email: string } | null {
    if (typeof window !== "undefined") {
      try {
        const kobiData = localStorage.getItem("Kobi");
        if (kobiData) {
          const parsed: KobiAuth = JSON.parse(kobiData);
          return parsed.user || null;
        }
      } catch (error) {
        console.error("Error parsing Kobi auth data:", error);
      }
    }
    return null;
  }

  getUserId(): string | null {
    if (typeof window !== "undefined") {
      try {
        const kobiData = localStorage.getItem("Kobi");
        if (kobiData) {
          const parsed: KobiAuth = JSON.parse(kobiData);
          return parsed.user?.id || null;
        }
      } catch (error) {
        console.error("Error parsing Kobi auth data:", error);
      }
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("Kobi");
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
