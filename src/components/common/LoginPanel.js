import React, { useState } from "react";
import axios from "axios";
import styles from "../css/LoginPanel.module.css";

const LoginPanel = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (isLogin) {
        // Jeśli użytkownik chce się zalogować
        response = await axios.post("http://localhost:5000/api/auth/login", formData);
      } else {
        // Jeśli użytkownik chce się zarejestrować
        response = await axios.post("http://localhost:5000/api/auth/register", formData);

        // Po rejestracji automatycznie logujemy użytkownika
        const loginData = await axios.post("http://localhost:5000/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        response = loginData; // Odpowiedź z logowania
      }

      // Przechowywanie tokenu i username
      localStorage.setItem("token", response.data.token);
      onLoginSuccess(response.data.username); // Ustawienie nazwy użytkownika w NavMenu

      alert(isLogin ? "Logged in successfully" : "Registered and logged in successfully");

      onClose(); // Zamknij okno logowania/rejestracji
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
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
