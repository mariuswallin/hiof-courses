"use client";

// app/components/pages/auth/Register.tsx

import { logout, register } from "@/app/api/auth/authServerActions";

export default function RegisterPage() {
  const handleSubmit = async (formData: FormData) => {
    try {
      const data = new FormData();
      data.set("username", "marius");
      data.set("email", "marius@example.com");
      data.set("password", "Password123");
      // await fetch("/api/v1/auth/register", {
      //   method: "POST",
      //   body: JSON.stringify({}),
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });
      const result = await register({}, data);
      console.log("Registration sumbit result:", result);
      if (!result.success) {
        console.error("Registration failed:", result.error);
      }
    } catch (error) {
      console.error("Registration:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      console.log("Logout result:", result);
      if (!result.success) {
        console.error("Logout failed:", result.error);
      }
    } catch (error) {
      console.error("Logout:", error);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form action={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" />
        </div>
        <button type="submit">Register</button>
      </form>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
}
