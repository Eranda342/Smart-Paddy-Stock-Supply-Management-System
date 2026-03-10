import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/users/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // Save token & role
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      // Redirect by role
      if (user.role === "FARMER") {
        navigate("/farmer");
      } else if (user.role === "MILL_OWNER") {
        navigate("/mill-owner");
      } else if (user.role === "ADMIN") {
        navigate("/admin");
      }

    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button style={{ marginTop: "15px" }} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;