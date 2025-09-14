import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { FaBars, FaTimes, FaUserPlus, FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';
import Modal from 'react-modal';
import { Button } from "./ui/button.jsx";
import { Label } from "./ui/label.jsx";
import { Input } from "./ui/input.jsx";
import { cn } from "../lib/utils.js";

const Header = ({ user, handleLogout, activePage, setActivePage, addHrac, newHrac, setNewHrac }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Zavřít menu při kliknutí mimo něj
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const openModal = () => {
    setModalIsOpen(true);
    setNewHrac('');
    setMenuOpen(false);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setNewHrac('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newHrac.trim()) {
      addHrac(e);
      closeModal();
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSeasonManagement = () => {
    setActivePage('season');
    setMenuOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setMenuOpen(false);
  };

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
              <div className="hamburger-menu-container" ref={menuRef}>
                <button onClick={toggleMenu} className="hamburger-button">
                  {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
                
                {menuOpen && (
                  <div className="dropdown-menu">
                    <div className="menu-header">
                      <FaUser className="user-icon" />
                      <span className="user-email">{user.email}</span>
                    </div>
                    <div className="menu-divider"></div>
                    
                    <button onClick={openModal} className="menu-item">
                      <FaUserPlus className="menu-icon" />
                      <span>Přidat hráče</span>
                    </button>
                    
                    <button onClick={handleSeasonManagement} className="menu-item">
                      <FaCog className="menu-icon" />
                      <span>Správa sezón</span>
                    </button>
                    
                    <div className="menu-divider"></div>
                    
                    <button onClick={handleLogoutClick} className="menu-item logout">
                      <FaSignOutAlt className="menu-icon" />
                      <span>Odhlásit</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="auth-button">
                <FaUser className="auth-icon" />
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

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal add-player-modal" overlayClassName="overlay">
        <h2>Přidat hráče</h2>
        <div className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-sm">Jméno hráče</Label>
              <Input
                id="playerName"
                type="text"
                value={newHrac}
                onChange={(e) => setNewHrac(e.target.value)}
                placeholder="Zadejte jméno hráče"
                className={cn(
                  "w-full",
                  "hover:border-gray-300",
                  "focus:border-primary focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200"
                )}
                autoFocus
              />
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className={cn(
                  "px-4 py-2",
                  "hover:bg-gray-50",
                  "transition-colors duration-200"
                )}
              >
                Zrušit
              </Button>
              <Button
                type="submit"
                className={cn(
                  "px-4 py-2",
                  "bg-primary hover:bg-primary/90",
                  "transition-colors duration-200"
                )}
              >
                Přidat hráče
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </header>
  );
};

export default Header;