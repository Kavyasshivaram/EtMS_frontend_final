import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import "./Register.css";

const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/3429/3429153.png"; 

function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", {
        ...data,
        role: "STUDENT",
      });
      setSuccess("Account created successfully. Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="etms-register-container">
      <div className="etms-register-card">
        <div className="etms-register-header">
          <img src={LOGO_URL} alt="EtMS Logo" />
          <h1>Create Account</h1>
          <p>Start your journey with EtMS</p>
        </div>

        {error && <div className="etms-alert error">{error}</div>}
        {success && <div className="etms-alert success">{success}</div>}

        <form onSubmit={handleRegister} className="etms-register-form">
          <div className="etms-input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>

          <div className="etms-input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@email.com"
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </div>

          <div className="etms-input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="10-digit number"
              maxLength={10}
              required
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />
          </div>

          <div className="etms-input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              required
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
          </div>

          <button type="submit" className="etms-submit-btn" disabled={loading}>
            {loading ? "Processing..." : "Register Now"}
          </button>
        </form>

        <div className="etms-register-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;