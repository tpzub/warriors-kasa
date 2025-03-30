import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaCoins, FaHandHoldingUsd, FaMoneyBillWave } from 'react-icons/fa';
import playerPlaceholder from '../assets/player-placeholder.png';
import { TopRankings } from './top-rankings';

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

  const getTopDebtors = () => {
    return [...hraci]
      .sort((a, b) => (b.dluhCelkem - (b.zaplatil || 0)) - (a.dluhCelkem - (a.zaplatil || 0)))
      .slice(0, 3)
      .filter(hrac => (hrac.dluhCelkem - (hrac.zaplatil || 0)) > 0);
  };

  const getTopSponsors = () => {
    return [...hraci]
      .sort((a, b) => (b.zaplatil || 0) - (a.zaplatil || 0))
      .slice(0, 3)
      .filter(hrac => (hrac.zaplatil || 0) > 0);
  };

  // Transform data for TopRankings component
  const topDebtorsForRankings = getTopDebtors().map(hrac => ({
    id: hrac.id,
    name: hrac.jmeno,
    imageUrl: hrac.photoURL || playerPlaceholder,
    amount: hrac.dluhCelkem - (hrac.zaplatil || 0)
  }));

  const topSponsorsForRankings = getTopSponsors().map(hrac => ({
    id: hrac.id,
    name: hrac.jmeno,
    imageUrl: hrac.photoURL || playerPlaceholder,
    amount: hrac.zaplatil || 0
  }));

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

      <div className="rankings-container" style={{ marginBottom: '20px', maxWidth: '90%', margin: '30px auto 30px auto' }}>
        <div className="flex flex-col md:flex-row gap-3 md:gap-5">
          <TopRankings 
            title="NEJVÍC ZAPLATIL" 
            items={topSponsorsForRankings} 
            type="sponsors" 
            className="flex-1"
          />
          <TopRankings 
            title="NEJVÍC DLUŽÍ" 
            items={topDebtorsForRankings} 
            type="debtors" 
            className="flex-1"
          />
          
        </div>
      </div>

      <div className="summary-container">
        <div className="summary-card-red">
          <div className="summary-card-left">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '40px' }}>
              <FaCoins className="summary-icon" size={24} />
            </div>
            <p style={{ fontWeight: '500', marginLeft: '5px', fontSize: '14px' }}>Celkový dluh všech hráčů</p>
          </div>
          <h3>{formattedTotalDebt}</h3>
        </div>
        <div className="summary-card-green">
          <div className="summary-card-left">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '40px' }}>
              <FaMoneyBillWave className="summary-icon" size={24} />
            </div>
            <p style={{ fontWeight: '500', marginLeft: '5px', fontSize: '14px' }}>Celkově všichni zaplatili</p>
          </div>
          <h3>{formattedTotalPaid}</h3>
        </div>
        <div className="summary-card-yellow">
          <div className="summary-card-left">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '40px' }}>
              <FaHandHoldingUsd className="summary-icon" size={24} />
            </div>
            <p style={{ fontWeight: '500', marginLeft: '5px', fontSize: '14px' }}>Ješte zbývá vybrat</p>
          </div>
          <h3>{formattedTotalRemaining}</h3>
        </div>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal" overlayClassName="overlay">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'center' }}>
          <img
            src={currentPlayer.photoURL || playerPlaceholder}
            alt="Player"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              marginRight: '10px',
              objectFit: 'cover',
              WebkitBorderRadius: '50%',
              MozBorderRadius: '50%',
              display: 'block'
            }}
          />
          <h2 style={{ marginLeft: '10px', fontSize: '20px' }}>{currentPlayer.jmeno}</h2>
        </div>
        <ul className="pokuta-list">
          {currentPlayer.pokuty && [...currentPlayer.pokuty]
            .sort((a, b) => {
              // Převod datumu na objekty Date
              const dateA = new Date(a.datum.split('.').reverse().join('-'));
              const dateB = new Date(b.datum.split('.').reverse().join('-'));
              // Řazení vzestupně - od nejstarších po nejnovější
              return dateA - dateB;
            })
            .map((pokuta, index) => {
            let nazev = pokuta.nazev;
            
            // Remove playoff indicator from display name
            nazev = nazev.replace(/ \(PO: x2\)/g, '');
            
            // Remove amount from the name if it's appended
            nazev = nazev.replace(/:\s*\d+\s*Kč$/g, '');
            nazev = nazev.replace(/\s+\d+\s*Kč$/g, '');
            
            // If there's still a colon, take only the part before it
            if (nazev.includes(':')) {
              nazev = nazev.split(':')[0].trim();
            }
            
            const isPlayOff = pokuta.isPlayOff || pokuta.nazev.includes('(PO: x2)');
            
            return (
              <li key={index} className={isPlayOff ? 'playoff-penalty' : ''}>
                <div className="pokuta-info">
                  <span className="bold-text">{index + 1}.&nbsp;</span>
                  <span className="pokuta-nazev">{nazev}</span>
                </div>
                <div className="pokuta-actions">
                  <span className="pokuta-amount">
                    {pokuta.castka} Kč
                  </span>
                  <small className="pokuta-datum">({pokuta.datum})</small>
                </div>
              </li>
            );
          })}
        </ul>
        <button onClick={closeModal} className="modal-close-button">Zavřít</button>
      </Modal>
    </div>
  );
};

export default PublicView;
