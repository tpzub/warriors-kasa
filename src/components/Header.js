import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { FaUserCog, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ user, handleLogout, activePage, setActivePage }) => {
  return (
    <header className="header">
      <nav>
        <div className="nav-top">
          <div className="nav-left">
            <Link to="/warriors-kasa" onClick={() => setActivePage('evidence')} className="logo-container">
              <img src={logo} alt="Logo" className="logo" />
              <span className="app-title">WARRIORS KASA</span>
            </Link>
          </div>
          <div className="nav-right">
            {user ? (
              <button onClick={handleLogout} className="auth-button">
                <FaSignOutAlt className="auth-icon" />
              </button>
            ) : (
              <Link to="/login" className="auth-button">
                <FaUserCog className="auth-icon" />
              </Link>
            )}
          </div>
        </div>
        <div className="nav-bottom">
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
        </div>
      </nav>
    </header>
  );
};

export default Header;