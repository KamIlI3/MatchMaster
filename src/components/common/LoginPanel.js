import React, { useState } from "react";
import axios from "axios";
import styles from "../css/LoginPanel.module.css";

const LoginPanel = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
    const dataToSend = isLogin ? { email: formData.email, password: formData.password } : formData;
    try {
      const endpoint = isLogin ? "http://localhost:5000/api/auth/login" : "http://localhost:5000/api/auth/register";
      const { data } = await axios.post(endpoint, dataToSend);

      if (isLogin) {
        localStorage.setItem("token", data.token);
        alert("Logged in successfully");
      } else {
        alert("Registered successfully");
      }

      onClose();
    } catch (err) {
      console.error("Error during submit:", err);
      setError(err.response.data.error || "An error occurred");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <button onClick={onClose} className={styles.close}>✕</button>
        <h2>{isLogin ? "Log In" : "Register"}</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit">{isLogin ? "Log In" : "Register"}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Log In"}
        </button>
      </div>
    </div>
  );
};

export default LoginPanel;
