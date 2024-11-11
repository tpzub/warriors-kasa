import React, { useState } from 'react';
import { FaEdit, FaTrashAlt, FaUpload, FaMoneyBillWave, FaHandHoldingUsd, FaCoins } from 'react-icons/fa';
import Modal from 'react-modal';
import playerPlaceholder from '../assets/player-placeholder.png';

const PlayerTable = ({
  hraci,
  editHracId,
  editHracJmeno,
  setEditHracId,
  setEditHracJmeno,
  updateHrac,
  deleteHrac,
  deletePokutaByIndex,
  editPaidAmountId,
  setEditPaidAmountId,
  handlePaidAmountChange,
  handleSavePaidAmount,
  paidAmounts,
  addHrac,
  newHrac,
  setNewHrac,
  handlePhotoUpload
}) => {
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

  const handleDeletePokuta = async (hracId, index) => {
    await deletePokutaByIndex(hracId, index);
    setCurrentPlayer((prev) => {
      const updatedPokuty = prev.pokuty.filter((_, i) => i !== index);
      return { ...prev, pokuty: updatedPokuty };
    });
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
                  {editHracId === hrac.id ? (
                    <form onSubmit={updateHrac}>
                      <input
                        type="text"
                        value={editHracJmeno}
                        onChange={(e) => setEditHracJmeno(e.target.value)}
                        placeholder="Jméno hráče"
                      />
                      <button className="save-button" type="submit">Uložit</button>
                      <button className="cancel-button" type="button" onClick={() => setEditHracId(null)}>Zpět</button>
                    </form>
                  ) : (
                    <>
                      <span className='photo-and-name'>
                        {hrac.photoURL ? (
                          <img src={hrac.photoURL} alt="Player" className="player-photo" />
                        ) : (
                          <img src={playerPlaceholder} alt="Placeholder" className="player-photo" />
                        )}
                        {hrac.jmeno}
                      </span>
                      <span className="action-buttons">
                        <label>
                          <FaUpload className="icon upload-icon" />
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e, hrac.id)} />
                        </label>
                        <FaEdit className="icon edit-icon" onClick={() => { setEditHracId(hrac.id); setEditHracJmeno(hrac.jmeno); }} />
                        <FaTrashAlt className="icon delete-icon" onClick={() => deleteHrac(hrac.id)} />
                      </span>
                    </>
                  )}
                </td>
                <td>
                  <button onClick={() => openModal(hrac)} className="show-button">
                    {hrac.pokuty.length}
                  </button>
                </td>
                <td><span className='amount'>{hrac.dluhCelkem} Kč</span></td>
                <td>
                  {editPaidAmountId === hrac.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSavePaidAmount(hrac.id); }}>
                      <input
                        type="number"
                        value={paidAmounts[hrac.id] || ''}
                        onChange={(e) => handlePaidAmountChange(e, hrac.id)}
                        placeholder="Zaplacená částka"
                      />
                      <button className="save-button" type="submit">Uložit</button>
                      <button className="cancel-button" type="button" onClick={() => setEditPaidAmountId(null)}>Zpět</button>
                    </form>
                  ) : (
                    <>
                      <span className='zaplatil-a-ikona'>
                        <span className='amount'>{hrac.zaplatil || 0} Kč</span>
                        <span className="action-buttons">
                          <FaEdit className="icon edit-icon" onClick={() => setEditPaidAmountId(hrac.id)} />
                        </span>
                      </span>
                    </>
                  )}
                </td>
                <td><span className='amount'>{hrac.dluhCelkem - (hrac.zaplatil || 0)} Kč</span></td>
              </tr>
            ))}
            <tr>
              <td colSpan="6">
                <form onSubmit={addHrac}>
                  <input
                    type="text"
                    value={newHrac}
                    onChange={(e) => setNewHrac(e.target.value)}
                    placeholder="Jméno hráče"
                  />
                  <button className="add-player-button" type="submit">Přidat hráče</button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>

        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal" overlayClassName="overlay">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'center' }}>
            <div className="overflow-hidden rounded-circle" style={{ width: '48px', height: '48px', marginRight: '10px' }}>
              <img
                src={currentPlayer.photoURL || playerPlaceholder}
                alt="Player"
                className="player-photo"
              />
            </div>
            <h2 style={{ marginLeft: '10px' , fontSize: '20px'}}>{currentPlayer.jmeno}</h2>
          </div>
          <ul>
            {currentPlayer.pokuty && currentPlayer.pokuty.map((pokuta, index) => (
              <li key={index}>
                <span className="bold-text">{index + 1}.&nbsp;</span>{pokuta.nazev}<small>({pokuta.datum})</small>
                <FaTrashAlt className="icon delete-icon" onClick={() => handleDeletePokuta(currentPlayer.id, index)} />
              </li>
            ))}
          </ul>
          <button onClick={closeModal} className="modal-close-button">Zavřít</button>
        </Modal>
      </div>

      <div className="top-debtors">
        <h3>TOP 3 DLUŽNÍCI 😠</h3>
        <div className="top-debtors-list">
          {getTopDebtors().map((hrac, index) => (
            <div key={hrac.id} className={`top-debtor-card top-${index + 1}`}>
              <div className="debtor-photo-container">
                <img 
                  src={hrac.photoURL || playerPlaceholder} 
                  alt={hrac.jmeno} 
                  className="top-debtor-photo" 
                />
                <div className="debtor-crown"></div>
              </div>
              <div className="debtor-info">
                <span className="debtor-name">{hrac.jmeno}</span>
                <span className="debtor-amount">{hrac.dluhCelkem - (hrac.zaplatil || 0)} Kč</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="summary-container">
        <div className="summary-card-red">
          <FaCoins className="summary-icon" />
          <p>Celkový dluh všech hráčů:</p>
          <h3>{formattedTotalDebt}</h3>
        </div>
        <div className="summary-card-green">
          <FaMoneyBillWave className="summary-icon" />
          <p>Celkově všichni zaplatili:</p>
          <h3>{formattedTotalPaid}</h3>
        </div>
        <div className="summary-card-yellow">
          <FaHandHoldingUsd className="summary-icon" />
          <p>Ješte zbývá vybrat:</p>
          <h3>{formattedTotalRemaining}</h3>
        </div>
      </div>
    </div>
  );
};

export default PlayerTable;
