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

  storeToken(token: string): void {
    localStorage.setItem("token", token);
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
