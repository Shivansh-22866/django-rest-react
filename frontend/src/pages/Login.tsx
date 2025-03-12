import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-96 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl mb-4">Login</h2>
        <input name="username" placeholder="Username" onChange={handleChange} className="border p-2 w-full mb-3" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border p-2 w-full mb-3" />
        <button type="submit" className="bg-blue-600 text-white p-2 w-full">Login</button>
        <p className="text-sm mt-2">
          Don't have an account? <span onClick={() => navigate("/signup")} className="text-blue-500 cursor-pointer">Sign up</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
