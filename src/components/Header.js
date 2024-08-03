import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header = ({ user, handleLogout, activePage, setActivePage }) => {
  return (
    <header className="header">
      <nav>
        <ul className="nav-list">
          <li className="logo-container">
            <Link to="/warriors-kasa" className="logo-link" onClick={() => setActivePage('evidence')}>
              <img src={logo} alt="Logo" className="logo" />
            </Link>
          </li>
          <div className="nav-buttons">
            <li>
              <Link 
                to="/warriors-kasa" 
                onClick={() => setActivePage('evidence')}
                className={activePage === 'evidence' ? 'active' : ''}
              >
                Dluhy
              </Link>
            </li>
            <li>
              <Link 
                to="/warriors-kasa" 
                onClick={() => setActivePage('penalties')}
                className={activePage === 'penalties' ? 'active' : ''}
              >
                Pokuty
              </Link>
            </li>
            <li>
              <Link 
                to="/warriors-kasa"
                onClick={() => setActivePage('payment')}
                className={activePage === 'payment' ? 'active' : ''}
              >
                Zaplatit
              </Link>
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
