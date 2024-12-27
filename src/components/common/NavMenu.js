import React, { useState, useEffect } from "react";
import styles from "../css/NavMenu.module.css";
import LoginPanel from "./LoginPanel";
import { NavLink } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faHourglass2 } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";

function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userName, setUserName] = useState(null); 

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
        <NavLink to="/" className={({ isActive }) =>
            isActive ? `${styles.NavigationLink} ${styles.ActiveLink}` : styles.NavigationLink
          }
          end><FontAwesomeIcon icon={faHouse} /> Start</NavLink>
        <NavLink to="/upcoming" className={({ isActive }) =>
            isActive ? `${styles.NavigationLink} ${styles.ActiveLink}` : styles.NavigationLink
          }><FontAwesomeIcon icon={faCalendarDays} /> Upcoming</NavLink>
        <NavLink to="/results" className={({ isActive }) =>
            isActive ? `${styles.NavigationLink} ${styles.ActiveLink}` : styles.NavigationLink
          }><FontAwesomeIcon icon={faTrophy} /> Results</NavLink>
        <NavLink to="/international" className={({ isActive }) =>
            isActive ? `${styles.NavigationLink} ${styles.ActiveLink}` : styles.NavigationLink
          }><FontAwesomeIcon icon={faGlobe} /> International</NavLink>
        <NavLink to="/live" className={({ isActive }) =>
            isActive ? `${styles.NavigationLink} ${styles.ActiveLink}` : styles.NavigationLink
          }><FontAwesomeIcon icon={faHourglass2} /> Live</NavLink>
      </nav>

      <div className={styles.logIn}>
        {userName ? (
          <button onClick={handleLogout} className={styles.activeLogInButton}>{userName} (Logout)</button>
        ) : (
          <button onClick={toggleLogin} className={styles.logInButton}><FontAwesomeIcon icon={faUser} /> Log In</button>
        )}
      </div>

      {showLogin && (
        <LoginPanel onClose={toggleLogin} onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default NavMenu;
