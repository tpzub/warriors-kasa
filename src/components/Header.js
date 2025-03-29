import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { FaUserCog, FaSignOutAlt, FaUserPlus } from 'react-icons/fa';
import Modal from 'react-modal';
import { Button } from "./ui/button.jsx";
import { Label } from "./ui/label.jsx";
import { Input } from "./ui/input.jsx";
import { cn } from "../lib/utils.js";

const Header = ({ user, handleLogout, activePage, setActivePage, addHrac, newHrac, setNewHrac }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
    setNewHrac('');
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
            {user && (
              <button onClick={openModal} className="auth-button add-player-icon-button">
                <FaUserPlus className="auth-icon" style={{ color: 'white' }} />
              </button>
            )}
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
                  "placeholder:text-sm",
                  "text-sm"
                )}
                style={{ caretColor: 'black' }}
              />
            </div>
            
            <div className="pt-6 flex justify-between">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm" type="submit">
                Přidat hráče
              </Button>
              <Button className="bg-gray-300 hover:bg-gray-400 text-black font-semibold text-sm" type="button" onClick={closeModal}>
                Zrušit
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </header>
  );
};

export default Header;