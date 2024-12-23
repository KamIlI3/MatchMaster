import React, { useState, useEffect } from "react";
import styles from "../css/NavMenu.module.css";
import LoginPanel from "./LoginPanel";
import { Link } from "react-router-dom";

function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userName, setUserName] = useState(null); // Stan dla nazwy użytkownika

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleLogin = () => setShowLogin(!showLogin);

  // Sprawdzanie, czy użytkownik jest już zalogowany po załadowaniu komponentu
  useEffect(() => {
    const storedUserName = localStorage.getItem("username"); // Pobieranie nazwy użytkownika z localStorage
    if (storedUserName) {
      setUserName(storedUserName); // Jeśli użytkownik jest zapisany, ustawiamy nazwę
    }
  }, []);

  // Funkcja logowania (np. z LoginPanel) – przypisuje nazwę użytkownika po udanym logowaniu
  const handleLoginSuccess = (username) => {
    setUserName(username); // Ustawiamy nazwę użytkownika po logowaniu
    localStorage.setItem("username", username); // Przechowujemy nazwę w localStorage
  };

  // Funkcja wylogowania – resetuje nazwę użytkownika
  const handleLogout = () => {
    setUserName(null); // Resetowanie stanu lokalnego
    localStorage.removeItem("username"); // Usuwanie nazwy użytkownika z localStorage
    localStorage.removeItem("token"); // Usuwanie tokenu z localStorage (jeśli używasz tokenu)
  };

  return (
    <div className={styles.NavMenu}>
      <button className={styles.hamburger} onClick={toggleMenu}>
        {isOpen ? "✕" : "☰"}
      </button>

      <nav className={`${styles.Menu} ${isOpen ? styles.MenuOpen : ""}`}>
        <Link to="/" className={styles.NavigationLink}>Start</Link>
        <Link to="/upcoming" className={styles.NavigationLink}>Upcoming</Link>
        <Link to="/results" className={styles.NavigationLink}>Results</Link>
        <Link to="/international" className={styles.NavigationLink}>International</Link>
        <Link to="/live" className={styles.NavigationLink}>Live</Link>
      </nav>

      <div className={styles.searchSettings}>
        {userName ? (
          <button onClick={handleLogout} className={styles.OptionButtons}>
            {userName} (Logout)
          </button>
        ) : (
          <button onClick={toggleLogin} className={styles.OptionButtons}>
            Log In
          </button>
        )}
      </div>

      {showLogin && (
        <LoginPanel onClose={toggleLogin} onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default NavMenu;
