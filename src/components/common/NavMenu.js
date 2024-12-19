import React, { useState } from "react";
import styles from "../css/NavMenu.module.css";

import { Link } from "react-router-dom";

function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

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
        <button className={styles.OptionButtons}>Search</button>
        <button className={styles.OptionButtons}>Settings</button>
      </div>
    </div>
  );
}

export default NavMenu;
