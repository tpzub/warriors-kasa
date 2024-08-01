import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaCoins, FaHandHoldingUsd, FaMoneyBillWave } from 'react-icons/fa';

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

  // Výpočet součtů jednotlivých sloupců
  const totalDebt = hraci.reduce((sum, hrac) => sum + hrac.dluhCelkem, 0);
  const totalPaid = hraci.reduce((sum, hrac) => sum + (hrac.zaplatil || 0), 0);
  const totalRemaining = hraci.reduce((sum, hrac) => sum + (hrac.dluhCelkem - (hrac.zaplatil || 0)), 0);

  return (
    <div>
      <h2 className="center-text ">Přehled dluhů</h2>
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
                <td>{hrac.jmeno}</td>
                <td>
                  <span onClick={() => openModal(hrac)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {hrac.pokuty.length}
                    <button onClick={() => openModal(hrac)} className="show-button">Ukázat</button>
                  </span>
                </td>
                <td>{hrac.dluhCelkem} Kč</td>
                <td>{hrac.zaplatil || 0} Kč</td>
                <td>{hrac.dluhCelkem - (hrac.zaplatil || 0)} Kč</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary-container">
        <div className="summary-card-red">
          <FaMoneyBillWave className="summary-icon" />
          <p>Celkový dluh všech hráčů:</p>
          <h3>{totalDebt} Kč</h3>
        </div>
        <div className="summary-card-green">
          <FaHandHoldingUsd className="summary-icon" />
          <p>Celkově všichni zaplatili:</p>
          <h3>{totalPaid} Kč</h3>
        </div>
        <div className="summary-card-yellow">
          <FaCoins className="summary-icon" />
          <p>Ješte zbývá vybrat:</p>
          <h3>{totalRemaining} Kč</h3>
        </div>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal" overlayClassName="overlay">
        <h2>{currentPlayer.jmeno}</h2>
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
