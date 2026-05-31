"use client";

import { useState } from "react";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");

  const login = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      localStorage.setItem("auth", "true");
      window.location.href = "/admin";
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-6 bg-white shadow rounded w-80">
        <input
          placeholder="username"
          className="border p-2 w-full mb-2"
          onChange={(e) => setU(e.target.value)}
        />

        <input
          placeholder="password"
          type="password"
          className="border p-2 w-full mb-2"
          onChange={(e) => setP(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-blue-600 text-white w-full py-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}
