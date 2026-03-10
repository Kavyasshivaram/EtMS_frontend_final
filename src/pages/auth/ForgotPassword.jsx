import { useState } from "react";
import api from "../../api/axiosConfig";

function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await api.post("/auth/forgot-password", { email });

    setMsg(res.data.message);
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>

      {msg && <p>{msg}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter trainer email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Request Reset</button>
      </form>
    </div>
  );
}

export default ForgotPassword;