import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Auth.css";

const API_URL = "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();

      formData.append("username", form.username);
      formData.append("password", form.password);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Login failed"
        );
      }

      // Save JWT
    localStorage.setItem("access_token", data.access_token);
    navigate("/dashboard");

      // Go to dashboard
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="auth-page">

    <div className="auth-card">

      <div className="auth-header">

        <div className="auth-logo">
          InSpectAI
        </div>

        <h1 className="auth-title">
          Welcome Back
        </h1>

        <p className="auth-subtitle">
          Login to InSpectAI
        </p>

      </div>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="auth-form"
      >

        <div className="auth-field">

          <label className="auth-label">
            Username
          </label>

          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            placeholder="Enter username"
            className="auth-input"
          />

        </div>


        <div className="auth-field">

          <label className="auth-label">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter password"
            className="auth-input"
          />

        </div>


        <button
          type="submit"
          disabled={loading}
          className="auth-button"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>


      <div className="auth-footer">

        Don't have an account?{" "}

        <Link
          to="/register"
          className="auth-link"
        >
          Create Account
        </Link>

      </div>

    </div>

  </div>
);
}