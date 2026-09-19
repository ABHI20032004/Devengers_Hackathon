import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const API_URL = "http://127.0.0.1:8000";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
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
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Registration failed"
        );
      }

      // Registration successful → go to login
      navigate("/login");

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
          AI
        </div>

        <h1 className="auth-title">
          Create Account
        </h1>

        <p className="auth-subtitle">
          Join InspectAI
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
            Email
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Enter email"
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
            minLength={6}
            placeholder="Enter password"
            className="auth-input"
          />

        </div>


        <button
          type="submit"
          disabled={loading}
          className="auth-button"
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>

      </form>


      <div className="auth-footer">

        Already have an account?{" "}

        <Link
          to="/login"
          className="auth-link"
        >
          Login
        </Link>

      </div>

    </div>

  </div>
);
}