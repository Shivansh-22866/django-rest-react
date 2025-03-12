# React + Django: A sample draft
I created this as a part of a draft which will be a feature for a project in the future. The architecture is simple, React handles the frontend and Django REST framework handles the backend.
The database is a local sqlite database for now, though one can change this to their own SQL database of their own liking.

## Backend - Django REST API

### Models
- `User`: Based on Django AbstractUser, with an additional field of free use, which enumerates the number of times a user can fetch a query
- `UserProfile`: One to one relation with additional fields of active subscription status and expiry date of that subscription
- `Domain`: A sector where a VC is interested to invest in
- `Region`: A country VC belongs from
- `Investor`: An investor model with fields as name, their company, their domains, their region, what investment stage they are willing to iinvest, contact emails, tags, created_at
- `SubscriptionPlan`: Model that defines the Subscription by fields such as name, price, duration and features
- `UserSubscription`: One-to-one relation between SubscriptionPlan and User, with extra detail fields like start_date, end_date and is_active

### Routes
- `/api/register/`: POST method, take user credentials in the request body such as username, email and password, returns created user as a response, the password is hashed, of course!
- `/api/login/`: POST method, take username and password in the request body, returns a refresh and access JWT token for user to authorize further actions
- `/api/investors/`: GET method, fetches the investors based on queries, the query parameters being domain, region, investment stage and the input query, requires `Bearer ${token}` as the Authorization Header
- `/api/subscription/plans/`: GET method, fetches the subscription plans available, requires a valid `Bearer ${token}` again
- `/api/subscription/subscribe/`: POST method, takes the planId in the request body, the valid `Bearer ${token}` of the user, and adds a subscription to the user. Note that buying a new subscription automatically makes older subscriptions inactive.
- `/api/subscription/status`: GET method, needs a user `Bearer ${token}` to obtain the status of the subscription the user had taken at the latest

## Frontend - React 19

### Components
- AuthGuard
- Header
- InvestorCard
- SearchBar
- Sidebar

### AuthContext

tsx
```
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../api/api";

interface AuthContextType {
  user: any;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  signup: (credentials: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ token });
    }
  }, []);

  const login = async ({ username, password }: { username: string; password: string }) => {
    try {
      const res = await instance.post("/login/", { username, password });
      localStorage.setItem("token", res.data.access);
      instance.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
      setUser(res.data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const signup = async ({ username, email, password }: { username: string; email: string; password: string }) => {
    try {
      await instance.post("/register/", { username, email, password });
      navigate("/login");
    } catch (error) {
      console.error("Signup failed", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete instance.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

```

### Pages

- HomePage: Landing page of the project
- Dashboard: Where the filter and query is executed to show investors
- Login: Login page
- Signup: Register page
- Subscriptions: To select a subscription
