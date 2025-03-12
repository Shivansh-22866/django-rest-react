import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import SubscriptionPage from "./pages/Subscriptions";
import HomePage from "./pages/HomePage";

const App = () => (
  <AuthProvider>
      <Header/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/subscription" element={<SubscriptionPage/>}/>
        <Route path="/" element={<HomePage/>}/>
      </Routes>
  </AuthProvider>
);

export default App;
