import React, { useState } from 'react';
import { FaTrashAlt, FaEdit, FaTimes, FaCoins, FaFileAlt } from 'react-icons/fa';
import Modal from 'react-modal';

const PenaltyTable = ({ pokuty, deletePokuta, editPokuta }) => {
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [penaltyToEdit, setPenaltyToEdit] = useState(null);
  const [localEditName, setLocalEditName] = useState('');
  const [localEditAmount, setLocalEditAmount] = useState('');

  const openEditModal = (pokuta) => {
    setPenaltyToEdit(pokuta);
    setLocalEditName(pokuta.nazev);
    setLocalEditAmount(pokuta.castka);
    setEditModalIsOpen(true);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setPenaltyToEdit(null);
  };

  const handleLocalNameChange = (e) => {
    setLocalEditName(e.target.value);
  };

  const handleLocalAmountChange = (e) => {
    setLocalEditAmount(e.target.value);
  };

  const handleSavePenaltyChanges = () => {
    editPokuta(penaltyToEdit.id, localEditName, parseInt(localEditAmount, 10));
    closeEditModal();
  };

  const handleDeletePenaltyConfirm = () => {
    if (window.confirm(`Opravdu chcete smazat pokutu ${penaltyToEdit.nazev}?`)) {
      deletePokuta(penaltyToEdit.id);
      closeEditModal();
    }
  };

  return (
    <><div className="table-container">
      <table className="evidence-table-penalties">
        <thead>
          <tr>
            <th>#</th>
            <th>Název pokuty</th>
            <th style={{ textAlign: 'center' }}>Částka</th>
            <th style={{ textAlign: 'center' }}>Akce</th>
          </tr>
        </thead>
        <tbody>
          {pokuty.map((pokuta, index) => (
            <tr key={pokuta.id}>
              <td>{index + 1}</td>
              <td>{pokuta.nazev}</td>
              <td style={{ textAlign: 'center' }}>{pokuta.castka} Kč</td>
              <td style={{ textAlign: 'center' }}>
                <button 
                  className="edit-player-btn" 
                  onClick={() => openEditModal(pokuta)}
                  style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                >
                  Upravit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className='penalties-notice'>
        <ul>
          <li><span className='bold-text'>Menší tresty se sčítají!</span></li>
          <li><span className='bold-text'>Play-off x2!</span> <span className="normal-text">(neplatí pro pozitivní věci jako gól, asistence, atd.)</span></li>
        </ul>
      </div>

      <Modal 
        isOpen={editModalIsOpen} 
        onRequestClose={closeEditModal} 
        className="edit-modal" 
        overlayClassName="overlay"
      >
        {penaltyToEdit && (
          <div className="edit-player-form">
            <h2>Upravit pokutu</h2>
            
            <div className="edit-section">
              <h3><FaFileAlt className="section-icon" /> Název pokuty</h3>
              <input
                type="text"
                value={localEditName}
                onChange={handleLocalNameChange}
                placeholder="Název pokuty"
                className="full-width-input"
                style={{ height: '38px' }}
              />
            </div>
            
            <div className="edit-section">
              <h3><FaCoins className="section-icon" /> Částka</h3>
              <input
                type="number"
                value={localEditAmount}
                onChange={handleLocalAmountChange}
                placeholder="Částka"
                className="full-width-input"
                style={{ height: '38px' }}
              />
            </div>
            
            <div className="edit-actions">
              <button 
                className="save-button" 
                onClick={handleSavePenaltyChanges}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                Uložit změny
              </button>
              
              <button 
                className="delete-button" 
                onClick={handleDeletePenaltyConfirm}
                style={{ backgroundColor: '#ED1B26', padding: '8px 16px', fontSize: '0.9rem' }}
              >
                <FaTrashAlt /> Smazat pokutu
              </button>
              
              <button 
                className="cancel-button" 
                onClick={closeEditModal}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                Zrušit
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PenaltyTable;
