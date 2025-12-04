import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/axios";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSignup = async () => {
    if (!name || !email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/auth/signup", {
        name,
        email,
        password,
        role: role.toUpperCase(),  // ✅ FIX HERE
      });

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Signup Failed",
        description: err.response?.data || "Unable to create account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* 🌟 Header */}
      <h1 className="text-4xl font-bold text-orange-500 mb-10">
        Edu Track
      </h1>

      {/* SIGNUP CARD */}
      <div className="max-w-md w-full bg-white border rounded-lg shadow p-6 space-y-6">
        <h2 className="text-3xl font-bold text-center">Signup</h2>

        <div className="space-y-4">
          <Input
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Dropdown for role */}
          <select
            className="border rounded-md px-3 py-2 w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option> {/* ✅ NEW */}
          </select>

          <Button onClick={handleSignup} className="w-full">
            Create Account
          </Button>

          <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
