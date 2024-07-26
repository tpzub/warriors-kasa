import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase/firebaseConfig';
import logo from '../assets/logo.png';

const Header = ({ isEvidencePage, setIsEvidencePage, user, handleLogout }) => {
  return (
    <header className="header">
      <nav>
        <ul className="nav-list">
          <li className="logo-container">
            <Link to={user ? "/admin" : "/"} className="logo-link">
              <img src={logo} alt="Logo" className="logo" />
            </Link>
          </li>
          <div className="nav-buttons">
            <li>
              <Link to={user ? "/admin" : "/"} onClick={() => setIsEvidencePage(true)} className={isEvidencePage ? 'active' : ''}>Dluhy</Link>
            </li>
            <li>
              <Link to={user ? "/admin" : "/"} onClick={() => setIsEvidencePage(false)} className={!isEvidencePage ? 'active' : ''}>Pokuty</Link>
            </li>
          </div>
          {user ? (
            <li className="nav-right">
              <button onClick={handleLogout} className="auth-button">Odhlásit se</button>
            </li>
          ) : (
            <li className="nav-right">
              <Link to="/login" className="auth-button">Admin</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
