import React, { useState } from 'react';
import { FaEdit, FaTrashAlt, FaMoneyBillWave, FaHandHoldingUsd, FaCoins } from 'react-icons/fa';
import Modal from 'react-modal';

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
  setNewHrac
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

  // Výpočet součtů jednotlivých sloupců
  const totalDebt = hraci.reduce((sum, hrac) => sum + hrac.dluhCelkem, 0);
  const totalPaid = hraci.reduce((sum, hrac) => sum + (hrac.zaplatil || 0), 0);
  const totalRemaining = hraci.reduce((sum, hrac) => sum + (hrac.dluhCelkem - (hrac.zaplatil || 0)), 0);

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
                      {hrac.jmeno}
                      <>
                      <span className='action-buttons'>
                        <FaEdit className="icon edit-icon" onClick={() => { setEditHracId(hrac.id); setEditHracJmeno(hrac.jmeno); }} />
                        <FaTrashAlt className="icon delete-icon" onClick={() => deleteHrac(hrac.id)} />
                      </span>    
                      </>
                    </>
                  )}
                </td>
                <td>
                  <span onClick={() => openModal(hrac)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {hrac.pokuty.length}
                    <button onClick={() => openModal(hrac)} className="show-button">Ukázat</button>
                  </span>
                </td>
                <td>{hrac.dluhCelkem} Kč</td>
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
                      {hrac.zaplatil || 0} Kč
                      <>
                      <span className='action-buttons'>
                        <FaEdit className="icon edit-icon" onClick={() => setEditPaidAmountId(hrac.id)} />
                      </span>   
                      </>
                    </>
                  )}
                </td>
                <td>{hrac.dluhCelkem - (hrac.zaplatil || 0)} Kč</td>
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
                  <button className="add-button" type="submit">Přidat hráče</button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>

        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal" overlayClassName="overlay">
          <h2>{currentPlayer.jmeno}</h2>
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

      <div className="summary-container">
        <div className="summary-card">
          <FaMoneyBillWave className="summary-icon" />
          <p>Celkový dluh všech hráčů:</p>
          <h3>{totalDebt} Kč</h3>
        </div>
        <div className="summary-card">
          <FaHandHoldingUsd className="summary-icon" />
          <p>Celkově všichni zaplatili:</p>
          <h3>{totalPaid} Kč</h3>
        </div>
        <div className="summary-card">
          <FaCoins className="summary-icon" />
          <p>Ješte zbývá vybrat:</p>
          <h3>{totalRemaining} Kč</h3>
        </div>
      </div>

    </div>  
  );
};

export default PlayerTable;
