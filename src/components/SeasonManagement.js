import React, { useState } from 'react';
import { FaFileExport, FaFilePdf, FaFileCsv, FaFileCode, FaRedo, FaExclamationTriangle } from 'react-icons/fa';
import Modal from 'react-modal';
import { exportToJSON, exportToCSV, exportToPDF } from '../lib/exportService';
import { toast } from 'react-toastify';
import { firestore } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const SeasonManagement = ({ hraci, pokuty, fetchHraci }) => {
  const [resetModalIsOpen, setResetModalIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Export funkce
  const handleExportJSON = () => {
    try {
      exportToJSON(hraci, pokuty);
      toast.success('Data exportována do JSON');
    } catch (error) {
      toast.error('Chyba při exportu do JSON');
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(hraci, pokuty);
      toast.success('Data exportována do CSV');
    } catch (error) {
      toast.error('Chyba při exportu do CSV');
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(hraci, pokuty);
      toast.success('Data exportována do PDF');
    } catch (error) {
      toast.error('Chyba při exportu do PDF');
      console.error(error);
    }
  };

  // Reset funkce
  const openResetModal = () => {
    setResetModalIsOpen(true);
  };

  const closeResetModal = () => {
    setResetModalIsOpen(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      // Načteme všechny hráče
      const hraciCollection = await getDocs(collection(firestore, 'hraci'));
      
      // Pro každého hráče vyresetujeme pokuty
      const updatePromises = hraciCollection.docs.map(hracDoc => {
        const hracRef = doc(firestore, 'hraci', hracDoc.id);
        return updateDoc(hracRef, {
          pokuty: [],
          dluhCelkem: 0,
          zaplatil: 0
        });
      });
      
      // Počkáme na dokončení všech updatů
      await Promise.all(updatePromises);
      
      toast.success(`Úspěšně vyresetováno ${hraciCollection.docs.length} hráčů`);
      
      // Načteme aktualizovaná data
      await fetchHraci();
      
      closeResetModal();
    } catch (error) {
      console.error('Chyba při resetování dat:', error);
      toast.error('Chyba při resetování dat');
    } finally {
      setIsResetting(false);
    }
  };

  const totalDebt = hraci.reduce((sum, h) => sum + h.dluhCelkem, 0);
  const totalPaid = hraci.reduce((sum, h) => sum + (h.zaplatil || 0), 0);

  return (
    <div className="season-management">
      <div className="management-card">
        <h3>Správa sezóny</h3>
        
        {/* Statistiky */}
        <div className="season-stats">
          <div className="stat-item">
            <span className="stat-label">Celkový dluh:</span>
            <span className="stat-value">{totalDebt.toLocaleString('cs-CZ')} Kč</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Zaplaceno:</span>
            <span className="stat-value">{totalPaid.toLocaleString('cs-CZ')} Kč</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Zbývá:</span>
            <span className="stat-value">{(totalDebt - totalPaid).toLocaleString('cs-CZ')} Kč</span>
          </div>
        </div>

        {/* Export sekce */}
        <div className="export-section">
          <h4>Export dat</h4>
          <div className="export-buttons">
            <button 
              className="export-btn json-btn"
              onClick={handleExportJSON}
              title="Export do JSON formátu"
            >
              <FaFileCode /> JSON
            </button>
            <button 
              className="export-btn csv-btn"
              onClick={handleExportCSV}
              title="Export do CSV (Excel)"
            >
              <FaFileCsv /> CSV
            </button>
            <button 
              className="export-btn pdf-btn"
              onClick={handleExportPDF}
              title="Export do PDF"
            >
              <FaFilePdf /> PDF
            </button>
          </div>
        </div>

        {/* Reset sekce */}
        <div className="reset-section">
          <h4>Nová sezóna</h4>
          <p className="reset-warning">
            <FaExclamationTriangle /> Před resetem nezapomeňte exportovat data!
          </p>
          <button 
            className="reset-btn"
            onClick={openResetModal}
          >
            <FaRedo /> Vyresetovat pokuty
          </button>
        </div>
      </div>

      {/* Modal pro potvrzení resetu */}
      <Modal
        isOpen={resetModalIsOpen}
        onRequestClose={closeResetModal}
        className="reset-modal"
        overlayClassName="overlay"
      >
        <div className="reset-modal-content">
          <h2><FaExclamationTriangle className="warning-icon" /> Potvrdit reset</h2>
          
          <div className="reset-warning-box">
            <p><strong>Tato akce je nevratná!</strong></p>
            <p>Budou vyresetovány následující údaje:</p>
            <ul>
              <li>Všechny pokuty hráčů</li>
              <li>Celkové dluhy (nastaví se na 0)</li>
              <li>Zaplacené částky (nastaví se na 0)</li>
            </ul>
            <p><strong>Zůstanou zachovány:</strong></p>
            <ul>
              <li>Seznam hráčů</li>
              <li>Definice typů pokut</li>
              <li>Fotografie hráčů</li>
            </ul>
          </div>

          <div className="reset-modal-actions">
            <button 
              className="cancel-btn"
              onClick={closeResetModal}
              disabled={isResetting}
            >
              Zrušit
            </button>
            <button 
              className="confirm-reset-btn"
              onClick={handleReset}
              disabled={isResetting}
            >
              {isResetting ? 'Resetuji...' : 'Potvrdit reset'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SeasonManagement;