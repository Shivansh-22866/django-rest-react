import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "", email: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(credentials);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-96 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl mb-4">Sign Up</h2>
        <input name="username" placeholder="Username" onChange={handleChange} className="border p-2 w-full mb-3" />
        <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full mb-3" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border p-2 w-full mb-3" />
        <button type="submit" className="bg-green-600 text-white p-2 w-full">Sign Up</button>
        <p className="text-sm mt-2">
          Already have an account? <span onClick={() => navigate("/login")} className="text-blue-500 cursor-pointer">Login</span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
