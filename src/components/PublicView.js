import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaCoins, FaHandHoldingUsd, FaMoneyBillWave } from 'react-icons/fa';
import playerPlaceholder from '../assets/player-placeholder.png';

const PublicView = ({ hraci }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState({});

  const openModal = (hrac) => {
    setCurrentPlayer(hrac);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentPlayer({});
  };

  const totalDebt = hraci.reduce((sum, hrac) => sum + hrac.dluhCelkem, 0);
  const totalPaid = hraci.reduce((sum, hrac) => sum + (hrac.zaplatil || 0), 0);
  const totalRemaining = hraci.reduce((sum, hrac) => sum + (hrac.dluhCelkem - (hrac.zaplatil || 0)), 0);

  const formattedTotalDebt = totalDebt.toLocaleString('cs-CZ') + ' Kč';
  const formattedTotalPaid = totalPaid.toLocaleString('cs-CZ') + ' Kč';
  const formattedTotalRemaining = totalRemaining.toLocaleString('cs-CZ') + ' Kč';

  return (
    <div>
      <div className="table-container">
        <table className="evidence-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Hráč</th>
              <th>Pokuty</th>
              <th>Dluh celkem</th>
              <th>Zaplatil</th>
              <th>Ještě dluží</th>
            </tr>
          </thead>
          <tbody>
            {hraci.map((hrac, index) => (
              <tr key={hrac.id}>
                <td>{index + 1}</td>
                <td>
                  <span className='photo-and-name'>
                    {hrac.photoURL ? (
                      <img src={hrac.photoURL} alt="Player" className="player-photo" />
                    ) : (
                      <img src={playerPlaceholder} alt="Placeholder" className="player-photo" />
                    )}
                    {hrac.jmeno}
                  </span>
                </td>
                <td>
                  <button onClick={() => openModal(hrac)} className="show-button">
                    {hrac.pokuty.length}
                  </button>
                </td>
                <td><span className='amount'>{hrac.dluhCelkem} Kč</span></td>
                <td><span className='amount'>{hrac.zaplatil || 0} Kč</span></td>
                <td><span className='amount'>{hrac.dluhCelkem - (hrac.zaplatil || 0)} Kč</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary-container">
        <div className="summary-card-red">
          <div className="summary-card-left">
            <FaMoneyBillWave className="summary-icon" />
            <p>Celkový dluh všech hráčů</p>
          </div>
          <h3>{formattedTotalDebt}</h3>
        </div>
        <div className="summary-card-green">
          <div className="summary-card-left">
            <FaHandHoldingUsd className="summary-icon" />
            <p>Celkově všichni zaplatili</p>
          </div>
          <h3>{formattedTotalPaid}</h3>
        </div>
        <div className="summary-card-yellow">
          <div className="summary-card-left">
            <FaCoins className="summary-icon" />
            <p>Ješte zbývá vybrat</p>
          </div>
          <h3>{formattedTotalRemaining}</h3>
        </div>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal" overlayClassName="overlay">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'center' }}>
          <div className="overflow-hidden rounded-circle" style={{ width: '48px', height: '48px', marginRight: '10px' }}>
            <img
              src={currentPlayer.photoURL || playerPlaceholder}
              alt="Player"
              className="player-photo"
            />
          </div>
          <h2 style={{ marginLeft: '10px', fontSize: '20px' }}>{currentPlayer.jmeno}</h2>
        </div>
        <ul>
          {currentPlayer.pokuty && currentPlayer.pokuty.map((pokuta, index) => (
            <li key={index}>
              <span className="bold-text">{index + 1}.&nbsp;</span>{pokuta.nazev}<small>({pokuta.datum})</small>
            </li>
          ))}
        </ul>
        <button onClick={closeModal} className="modal-close-button">Zavřít</button>
      </Modal>
    </div>
  );
};

export default PublicView;
