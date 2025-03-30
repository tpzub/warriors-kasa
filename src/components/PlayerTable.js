import React, { useState } from 'react';
import { FaEdit, FaTrashAlt, FaUpload, FaMoneyBillWave, FaHandHoldingUsd, FaCoins, FaUser, FaImages, FaPlus, FaInfoCircle, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';
import playerPlaceholder from '../assets/player-placeholder.png';
import { TopRankings } from './top-rankings';
import { toast } from 'react-toastify';
import { savePlayerPaymentData } from '../lib/firebaseService';

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
  setPaidAmounts,
  handlePhotoUpload,
  handleEditPaidAmount,
  setHraci
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState({});
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState(null);
  const [localEditName, setLocalEditName] = useState('');
  const [localNewPayment, setLocalNewPayment] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [localLoading, setLocalLoading] = useState(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  const openModal = (hrac) => {
    const updatedHrac = hraci.find(h => h.id === hrac.id) || hrac;
    console.log('Otevírám modální okno pro hráče:', updatedHrac);
    setCurrentPlayer(updatedHrac);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentPlayer({});
  };

  const openEditModal = (hrac) => {
    setPlayerToEdit(hrac);
    setLocalEditName(hrac.jmeno);
    setLocalNewPayment('');
    setPhotoFile(null);
    setEditModalIsOpen(true);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setPlayerToEdit(null);
    setPhotoFile(null);
  };

  const handleLocalNameChange = (e) => {
    setLocalEditName(e.target.value);
  };

  const handleLocalNewPaymentChange = (e) => {
    setLocalNewPayment(e.target.value);
  };

  const handleLocalPhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSavePlayerChanges = async () => {
    console.log('Ukládám změny pro hráče:', playerToEdit.id);
    
    try {
      // Zjišťujeme, jaké změny byly provedeny
      const hasNameChange = localEditName && localEditName !== playerToEdit.jmeno;
      const hasPaymentChange = localNewPayment && localNewPayment !== '';
      const hasPhotoChange = photoFile !== null;
      
      console.log('Změny:', {
        hasNameChange,
        hasPaymentChange,
        hasPhotoChange,
        localEditName,
        playerName: playerToEdit.jmeno,
        localNewPayment
      });
      
      // Nejprve zavřeme modální okno
      closeEditModal();
      
      // Provedeme postupně změny s rozestupy, aby se nezpracovávaly současně
      
      // 1. Pokud změna jména, uložíme ji
      if (hasNameChange) {
        console.log('Ukládám jméno:', localEditName);
        setEditHracId(playerToEdit.id);
        setEditHracJmeno(localEditName);
        await updateHrac(playerToEdit.id, { jmeno: localEditName });
      }
      
      // 2. Pokud změna platby, uložíme ji - ale pouze pokud byla zadána hodnota
      if (hasPaymentChange) {
        console.log('Ukládám platbu:', localNewPayment);
        
        // Přímo zavolat funkci pro ukládání částky
        await savePlayerPayment(playerToEdit.id, parseFloat(localNewPayment));
      }
      
      // 3. Pokud změna fotky, uložíme ji
      if (hasPhotoChange) {
        console.log('Nahrávám foto');
        setTimeout(() => {
          const event = { target: { files: [photoFile] } };
          handlePhotoUpload(event, playerToEdit.id);
        }, 300);
      }
      
    } catch (error) {
      console.error('Chyba při ukládání:', error);
      toast.error('Nastala chyba při ukládání změn');
    }
  };

  // Nová funkce pro přímé uložení platby - používá importovaný firebase service
  const savePlayerPayment = async (hracId, amount) => {
    try {
      console.log(`Ukládám částku ${amount} pro hráče ${hracId}`);
      
      if (!hracId || isNaN(amount) || amount === 0) {
        console.log('Neplatná data pro uložení platby');
        return;
      }
      
      const hrac = hraci.find(h => h.id === hracId);
      if (!hrac) {
        console.error(`Hráč s ID ${hracId} nebyl nalezen`);
        toast.error('Hráč nebyl nalezen');
        return;
      }
      
      // Voláme funkci z firebaseService
      const result = await savePlayerPaymentData(hracId, amount);
      
      if (result && result.success) {
        // Aktualizujeme lokální state - místo volání fetch funkce
        setHraci(prevHraci => 
          prevHraci.map(h => 
            h.id === hracId ? { ...h, zaplatil: result.newAmount } : h
          )
        );
        
        // Zobrazení pouze zprávy o platbě
        if (amount > 0) {
          toast.success(`Přidáno ${amount} Kč pro hráče ${hrac.jmeno}`);
        } else {
          toast.success(`Odebráno ${Math.abs(amount)} Kč hráči ${hrac.jmeno}`);
        }
      } else {
        toast.error('Nastala chyba při ukládání platby');
      }
    } catch (error) {
      console.error('Chyba při ukládání platby:', error);
      toast.error('Nastala chyba při ukládání platby');
    }
  };

  const handleDeletePlayerConfirm = () => {
    if (window.confirm(`Opravdu chcete smazat hráče ${playerToEdit.jmeno}?`)) {
      deleteHrac(playerToEdit.id);
      closeEditModal();
    }
  };

  const handleDeletePokuta = async (hracId, index) => {
    console.log('Mažu pokutu:', hracId, index);
    try {
      const success = await deletePokutaByIndex(hracId, index);
      console.log('Výsledek mazání:', success);
      if (success) {
        setCurrentPlayer((prev) => {
          const updatedPokuty = prev.pokuty.filter((_, i) => i !== index);
          return { ...prev, pokuty: updatedPokuty };
        });
      }
    } catch (error) {
      console.error('Chyba při mazání pokuty:', error);
    }
  };

  const getFinalRemainingDebt = (hrac, newPayment) => {
    const currentPaid = hrac.zaplatil || 0;
    const paymentValue = newPayment ? parseFloat(newPayment) : 0;
    const finalPaid = currentPaid + paymentValue;
    
    return Math.max(0, hrac.dluhCelkem - Math.max(0, finalPaid));
  };

  const wouldCauseNegativePaid = (hrac, newPayment) => {
    const currentPaid = hrac.zaplatil || 0;
    const paymentValue = newPayment ? parseFloat(newPayment) : 0;
    return (currentPaid + paymentValue) < 0;
  };

  const getFinalPaidAmount = (hrac, newPayment) => {
    const currentPaid = hrac.zaplatil || 0;
    const paymentValue = newPayment ? parseFloat(newPayment) : 0;
    return Math.max(0, currentPaid + paymentValue);
  };

  const getRemainingDebt = (hrac) => {
    const paid = hrac.zaplatil || 0;
    return Math.max(0, hrac.dluhCelkem - paid);
  };

  const totalDebt = hraci.reduce((sum, hrac) => sum + hrac.dluhCelkem, 0);
  const totalPaid = hraci.reduce((sum, hrac) => sum + (hrac.zaplatil || 0), 0);
  const totalRemaining = hraci.reduce((sum, hrac) => sum + getRemainingDebt(hrac), 0);

  const formattedTotalDebt = totalDebt.toLocaleString('cs-CZ') + ' Kč';
  const formattedTotalPaid = totalPaid.toLocaleString('cs-CZ') + ' Kč';
  const formattedTotalRemaining = totalRemaining.toLocaleString('cs-CZ') + ' Kč';

  const getTopDebtors = () => {
    return [...hraci]
      .sort((a, b) => getRemainingDebt(b) - getRemainingDebt(a))
      .slice(0, 3)
      .filter(hrac => getRemainingDebt(hrac) > 0);
  };

  const getTopSponsors = () => {
    return [...hraci]
      .sort((a, b) => (b.zaplatil || 0) - (a.zaplatil || 0))
      .slice(0, 3)
      .filter(hrac => (hrac.zaplatil || 0) > 0);
  };

  const topDebtorsForRankings = getTopDebtors().map(hrac => ({
    id: hrac.id,
    name: hrac.jmeno,
    imageUrl: hrac.photoURL || playerPlaceholder,
    amount: getRemainingDebt(hrac)
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
              <th>Akce</th>
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
                <td><span className='amount'>{getRemainingDebt(hrac)} Kč</span></td>
                <td>
                  <button 
                    className="edit-player-btn" 
                    onClick={() => openEditModal(hrac)}
                    style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                  >
                    Upravit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
            <h2 style={{ marginLeft: '10px' , fontSize: '20px'}}>{currentPlayer.jmeno}</h2>
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
              
              nazev = nazev.replace(/ \(PO: x2\)/g, '');
              
              nazev = nazev.replace(/:\s*\d+\s*Kč$/g, '');
              nazev = nazev.replace(/\s+\d+\s*Kč$/g, '');
              
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
                    <FaTimes 
                      className="icon delete-icon" 
                      style={{ color: '#d9534f', fontSize: '16px', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Najdeme původní index pokuty v neseřazeném poli, protože API potřebuje původní index
                        const originalIndex = currentPlayer.pokuty.findIndex(
                          p => p.id === pokuta.id || (p.nazev === pokuta.nazev && p.datum === pokuta.datum && p.castka === pokuta.castka)
                        );
                        console.log('Kliknuto na ikonu křížku pro pokutu, původní index:', originalIndex);
                        
                        deletePokutaByIndex(currentPlayer.id, originalIndex).then(success => {
                          console.log('Výsledek mazání:', success);
                          if (success) {
                            setCurrentPlayer((prev) => {
                              const updatedPokuty = prev.pokuty.filter((_, i) => i !== originalIndex);
                              return { ...prev, pokuty: updatedPokuty };
                            });
                          }
                        }).catch(error => {
                          console.error('Chyba při mazání pokuty:', error);
                        });
                      }} 
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <button onClick={closeModal} className="modal-close-button">Zavřít</button>
        </Modal>

        <Modal 
          isOpen={editModalIsOpen} 
          onRequestClose={closeEditModal} 
          className="edit-modal" 
          overlayClassName="overlay"
        >
          {playerToEdit && (
            <div className="edit-player-form">
              <h2>Upravit hráče</h2>
              
              <div className="edit-section">
                <h3><FaUser className="section-icon" /> Profilový obrázek</h3>
                <div className="photo-upload-section">
                  <img 
                    src={photoFile ? URL.createObjectURL(photoFile) : (playerToEdit.photoURL || playerPlaceholder)} 
                    alt="Player" 
                    className="edit-player-photo" 
                  />
                  <label className="upload-btn">
                    <FaImages /> Nahrát fotku
                    <input type="file" style={{ display: 'none' }} onChange={handleLocalPhotoUpload} accept="image/*" />
                  </label>
                </div>
              </div>
              
              <div className="edit-section">
                <h3><FaUser className="section-icon" /> Jméno hráče</h3>
                <input
                  type="text"
                  value={localEditName}
                  onChange={handleLocalNameChange}
                  placeholder="Jméno hráče"
                  className="full-width-input"
                />
              </div>
              
              <div className="edit-section">
                <h3>
                  <FaMoneyBillWave className="section-icon" /> Přidat platbu
                  <FaInfoCircle 
                    className="info-icon" 
                    style={{ 
                      marginLeft: '8px', 
                      cursor: 'pointer', 
                      color: '#17a2b8',
                      fontSize: '16px',
                      position: 'relative'
                    }}
                    title="Pro vrácení platby zadejte zápornou hodnotu (např. -100)"
                    onClick={() => setShowPaymentInfo(!showPaymentInfo)}
                  />
                </h3>
                {showPaymentInfo && (
                  <div className="payment-note" style={{ background: '#f8f9fa', padding: '8px', borderRadius: '4px', marginBottom: '10px', fontSize: '0.85rem' }}>
                    <span>Pro vrácení platby zadejte zápornou hodnotu (např. -100)</span>
                  </div>
                )}
                <input
                  type="number"
                  value={localNewPayment}
                  onChange={handleLocalNewPaymentChange}
                  placeholder="Zadejte částku"
                  className="full-width-input"
                />
                <div className="amount-info">
                  <div>
                    <span className="amount-label">Celkový dluh:</span>
                    <span className="amount-value" style={{ color: '#d9534f' }}>{playerToEdit.dluhCelkem} Kč</span>
                  </div>
                  <div>
                    <span className="amount-label">Zaplaceno:</span>
                    <span className="amount-value" style={{ color: '#5cb85c' }}>{playerToEdit.zaplatil || 0} Kč</span>
                  </div>
                  <div>
                    <span className="amount-label">Zbývá zaplatit:</span>
                    <span className="amount-value" style={{ color: '#f0ad4e' }}>{getRemainingDebt(playerToEdit)} Kč</span>
                  </div>
                  {localNewPayment && (
                    <div className={`payment-preview ${parseFloat(localNewPayment) < 0 ? 'negative-payment' : 'positive-payment'}`}>
                      <span className="amount-label">
                        {parseFloat(localNewPayment) < 0 ? 'Po vrácení platby:' : 'Po přidání platby:'}
                      </span>
                      <span className="amount-value">
                        {wouldCauseNegativePaid(playerToEdit, localNewPayment) ? (
                          <span className="payment-warning">
                            (Nelze mít záporné zaplaceno, bude nastaveno na 0)
                          </span>
                        ) : null}
                        <span style={{ color: '#5cb85c' }}>
                          {`Zaplaceno: ${getFinalPaidAmount(playerToEdit, localNewPayment)} Kč`}
                        </span>
                        <span>
                          {parseFloat(localNewPayment) >= playerToEdit.dluhCelkem - (playerToEdit.zaplatil || 0) ? (
                            <span className="payment-info">
                              (Zbývající dluh bude 0 Kč)
                            </span>
                          ) : (
                            <span style={{ color: '#f0ad4e' }}>
                              {`, Zbývá: ${getFinalRemainingDebt(playerToEdit, localNewPayment)} Kč`}
                            </span>
                          )}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="edit-actions">
                <button 
                  className="save-button" 
                  onClick={handleSavePlayerChanges}
                >
                  Uložit změny
                </button>
                
                <button 
                  className="delete-button" 
                  onClick={handleDeletePlayerConfirm}
                >
                  <FaTrashAlt /> Smazat hráče
                </button>
                
                <button 
                  className="cancel-button" 
                  onClick={closeEditModal}
                >
                  Zrušit
                </button>
              </div>
            </div>
          )}
        </Modal>
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
            <p style={{ fontWeight: '500', marginLeft: '5px', fontSize: '14px' }}>Celkový dluh všech hráčů:</p>
          </div>
          <h3>{formattedTotalDebt}</h3>
        </div>
        <div className="summary-card-green">
          <div className="summary-card-left">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '40px' }}>
              <FaMoneyBillWave className="summary-icon" size={24} />
            </div>
            <p style={{ fontWeight: '500', marginLeft: '5px', fontSize: '14px' }}>Celkově všichni zaplatili:</p>
          </div>
          <h3>{formattedTotalPaid}</h3>
        </div>
        <div className="summary-card-yellow">
          <div className="summary-card-left">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '40px' }}>
              <FaHandHoldingUsd className="summary-icon" size={24} />
            </div>
            <p style={{ fontWeight: '500', marginLeft: '5px', fontSize: '14px' }}>Ješte zbývá vybrat:</p>
          </div>
          <h3>{formattedTotalRemaining}</h3>
        </div>
      </div>
    </div>
  );
};

export default PlayerTable;
