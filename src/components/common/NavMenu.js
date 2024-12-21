import React, { useState } from "react";
import styles from "../css/NavMenu.module.css";
import LoginPanel from "./LoginPanel";

import { Link } from "react-router-dom";

function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleLogin = () => setShowLogin(!showLogin);

  return (
    <div className={styles.NavMenu}>
      <button className={styles.hamburger} onClick={toggleMenu}>
        {isOpen ? "✕" : "☰"}
      </button>

      <nav className={`${styles.Menu} ${isOpen ? styles.MenuOpen : ""}`}>
        <Link
          to="/"
          className={styles.NavigationLink}
        >
          Start
        </Link>
        <Link
          to="/upcoming"
          className={styles.NavigationLink}
        >
          Upcoming
        </Link>
        <Link
          to="/results"
          className={styles.NavigationLink}
        >
          Results
        </Link>
        <Link
          to="/international"
          className={styles.NavigationLink}
        >
          International
        </Link>
        <Link
          to="/live"
          className={styles.NavigationLink}
        >
          Live
        </Link>
      </nav>

      <div
        className={styles.searchSettings}
      >
         <button onClick={toggleLogin} className={styles.OptionButtons}>Log In</button>
      </div>
      {showLogin && <LoginPanel onClose={toggleLogin} />}
    </div>
  );
}

export default NavMenu;
