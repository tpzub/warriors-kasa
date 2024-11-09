import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { FaUserCog } from 'react-icons/fa';

const Header = ({ user, handleLogout, activePage, setActivePage }) => {
  return (
    <header className="header">
      <nav>
        <ul className="nav-list">
          <li className="logo-container">
            <Link to="/warriors-kasa" onClick={() => setActivePage('evidence')}>
              <img src={logo} alt="Logo" className="logo" />
            </Link>
          </li>
          <div className="nav-buttons">
            <Link 
              to="/warriors-kasa" 
              onClick={() => setActivePage('evidence')}
              className={activePage === 'evidence' ? 'active' : ''}
            >
              Dluhy
            </Link>
            <Link 
              to="/warriors-kasa" 
              onClick={() => setActivePage('penalties')}
              className={activePage === 'penalties' ? 'active' : ''}
            >
              Pokuty
            </Link>
            <Link 
              to="/warriors-kasa"
              onClick={() => setActivePage('payment')}
              className={activePage === 'payment' ? 'active' : ''}
            >
              Zaplatit
            </Link>
          </div>
          {user ? (
            <button onClick={handleLogout} className="auth-button">
              <FaUserCog className="auth-icon" />
              <span className="auth-text">Odhlásit se</span>
            </button>
          ) : (
            <Link to="/login" className="auth-button">
              <FaUserCog className="auth-icon" />
              <span className="auth-text">Admin</span>
            </Link>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
