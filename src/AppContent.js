import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { firestore, auth, storage } from './firebase/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Header from './components/Header';
import PlayerForm from './components/PlayerForm';
import PlayerFormShadcn from './components/PlayerFormShadcn';
import PenaltyForm from './components/PenaltyForm';
import PlayerTable from './components/PlayerTable';
import PenaltyTable from './components/PenaltyTable';
import Login from './components/Login';
import PublicView from './components/PublicView';
import PublicPenalties from './components/PublicPenalties';
import Platba from './components/Platba';
import { collection, getDocs, increment, doc, updateDoc, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateHracData, fetchSpecificHracData } from './lib/firebaseService';

const AppContent = () => {
  const [user, loading, error] = useAuthState(auth);
  const [hraci, setHraci] = useState([]);
  const [pokuty, setPokuty] = useState([]);
  const [newHrac, setNewHrac] = useState('');
  const [editHracId, setEditHracId] = useState(null);
  const [editHracJmeno, setEditHracJmeno] = useState('');
  const [paidAmounts, setPaidAmounts] = useState({});
  const [isEvidencePage, setIsEvidencePage] = useState(true);
  const [editPaidAmountId, setEditPaidAmountId] = useState(null);
  const [activePage, setActivePage] = useState('evidence'); // Nový stav pro přepínání stránek
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      console.log('Loading...');
      return;
    }
    if (error) {
      console.error('Error:', error);
      return;
    }
    fetchHraci();
    fetchPokuty();
  }, [loading, error]);

  useEffect(() => {
    if (user) {
      console.log('User is logged in:', user);
      navigate('/warriors-kasa');
    }
  }, [user, navigate]);

  const fetchHraci = async () => {
    console.log('Načítám data hráčů...');
    try {
      const hraciCollection = await getDocs(collection(firestore, 'hraci'));
      const hraciData = hraciCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      hraciData.sort((a, b) => a.jmeno.localeCompare(b.jmeno));
      
      // Kontrola, zda je potřeba aktualizovat stav
      let shouldUpdate = false;
      
      // Pokud je jiný počet hráčů, určitě aktualizujeme
      if (hraciData.length !== hraci.length) {
        shouldUpdate = true;
      } else {
        // Projdeme hráče a podíváme se, zda se změnili
        for (let i = 0; i < hraciData.length; i++) {
          const newHrac = hraciData[i];
          const oldHrac = hraci.find(h => h.id === newHrac.id);
          
          if (!oldHrac) {
            shouldUpdate = true;
            break;
          }
          
          // Kontrola změn v důležitých polích
          if (
            newHrac.jmeno !== oldHrac.jmeno ||
            newHrac.zaplatil !== oldHrac.zaplatil ||
            newHrac.dluhCelkem !== oldHrac.dluhCelkem ||
            newHrac.photoURL !== oldHrac.photoURL ||
            JSON.stringify(newHrac.pokuty) !== JSON.stringify(oldHrac.pokuty)
          ) {
            shouldUpdate = true;
            break;
          }
        }
      }
      
      // Pokud je potřeba aktualizovat stav, uděláme to
      if (shouldUpdate) {
        console.log('Nalezeny změny, aktualizuji stav...');
        setHraci(hraciData);
        
        // Aktualizace paidAmounts pouze pokud je potřeba
        const paidAmountsData = {};
        hraciData.forEach(hrac => {
          paidAmountsData[hrac.id] = ''; // Resetujeme na prázdné hodnoty
        });
        setPaidAmounts(paidAmountsData);
      } else {
        console.log('Žádné změny v datech hráčů, stav nebyl aktualizován.');
      }
    } catch (error) {
      console.error('Chyba při načítání hráčů:', error);
      toast.error('Nastala chyba při načítání dat hráčů');
    }
  };

  const fetchPokuty = async () => {
    const pokutyCollection = await getDocs(collection(firestore, 'pokuty'));
    let pokutyData = pokutyCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    pokutyData = pokutyData.sort((a, b) => a.castka - b.castka); // Seřadit podle hodnoty
    setPokuty(pokutyData);
  };

  const generateId = () => '_' + Math.random().toString(36).substring(2, 11);

  const addPokuta = async (hracIds, pokuta) => {
    const selectedPokuta = { ...pokuta, id: generateId() }; // Ensure unique ID
    const hraciData = [...hraci];
  
    for (let hracId of hracIds) {
      const hracDoc = doc(firestore, 'hraci', hracId);
      const hracIndex = hraciData.findIndex(hrac => hrac.id === hracId);
      if (hracIndex === -1) {
        console.error(`Hráč s ID ${hracId} nebyl nalezen.`);
        continue;
      }
      const hracDataItem = hraciData[hracIndex];
      const updatedPokuty = [...hracDataItem.pokuty, selectedPokuta]; // Manually add fine to array
  
      await updateDoc(hracDoc, {
        pokuty: updatedPokuty,
        dluhCelkem: increment(pokuta.castka)
      });
  
      hraciData[hracIndex] = { ...hracDataItem, pokuty: updatedPokuty, dluhCelkem: hracDataItem.dluhCelkem + pokuta.castka };
    }
  
    setHraci(hraciData);
    toast.success('Pokuta byla úspěšně přidána');
  };
  
  

  const addHrac = async (e) => {
    e.preventDefault();
    await addDoc(collection(firestore, 'hraci'), {
      jmeno: newHrac,
      pokuty: [],
      dluhCelkem: 0,
      zaplatil: 0,
      photoURL: ''
    });
    setNewHrac('');
    fetchHraci();
    toast.success('Hráč úspěšně přidán!');
  };

  const updateHrac = async (hracId, data) => {
    try {
      // Pokud je poskytnut hracId jako parametr, použijeme ho, jinak použijeme editHracId ze stavu
      const idToUpdate = hracId || editHracId;
      const dataToUpdate = data || { jmeno: editHracJmeno };
      
      // Použijeme novou funkci z firebaseService
      const success = await updateHracData(idToUpdate, dataToUpdate);
      
      if (success) {
        // Resetujeme stavy pouze pokud používáme lokální stav
        if (!hracId) {
          setEditHracId(null);
          setEditHracJmeno('');
        }
        
        // Načteme aktualizovaná data
        if (hracId) {
          // Pokud máme konkrétní ID, načteme jen tohoto hráče
          await fetchSpecificHrac(hracId);
        } else {
          // Jinak načteme všechny
          await fetchHraci();
        }
        
        toast.success('Hráč úspěšně aktualizován!');
      }
    } catch (error) {
      console.error('Chyba při aktualizaci hráče:', error);
      toast.error('Nastala chyba při aktualizaci hráče.');
    }
  };

  const deleteHrac = async (id) => {
    if (window.confirm('Opravdu chcete smazat tohoto hráče?')) {
      await deleteDoc(doc(firestore, 'hraci', id));
      fetchHraci();
      toast.success('Hráč úspěšně smazán!');
    }
  };

  const deletePokuta = async (id) => {
    if (window.confirm('Opravdu chcete smazat tuto pokutu?')) {
      try {
        const pokutaDoc = doc(firestore, 'pokuty', id);
        await deleteDoc(pokutaDoc);
        fetchPokuty(); // Aktualizujeme seznam pokut po úspěšném smazání
        toast.success('Pokuta úspěšně smazána!');
      } catch (error) {
        console.error('Error deleting pokuta:', error);
        toast.error('Chyba při mazání pokuty.');
      }
    }
  };

  const deletePokutaByIndex = async (hracId, index) => {
    console.log('deletePokutaByIndex called with:', hracId, index);
    
    // Použijeme window.confirm pro zobrazení potvrzovacího dialogu
    const confirmed = window.confirm('Opravdu chcete smazat tuto pokutu?');
    console.log('Potvrzení mazání:', confirmed);
    
    if (confirmed) {
      try {
        const hracDoc = doc(firestore, 'hraci', hracId);
        const hracData = hraci.find(h => h.id === hracId);
        
        if (!hracData) {
          console.error('Hráč nebyl nalezen:', hracId);
          return false;
        }
        
        const pokutaToDelete = hracData.pokuty[index];
    
        if (!pokutaToDelete) {
          console.error('Pokuta to delete not found');
          return false;
        }
    
        console.log('Mažu pokutu:', pokutaToDelete);
        
        const updatedPokuty = hracData.pokuty.filter((_, i) => i !== index);
        const updatedDluhCelkem = hracData.dluhCelkem - pokutaToDelete.castka;
    
        await updateDoc(hracDoc, {
          pokuty: updatedPokuty,
          dluhCelkem: updatedDluhCelkem
        });
    
        const updatedHraci = hraci.map(hrac =>
          hrac.id === hracId ? { ...hrac, pokuty: updatedPokuty, dluhCelkem: updatedDluhCelkem } : hrac
        );
    
        setHraci(updatedHraci);
        toast.success('Pokuta úspěšně smazána!');
        console.log('Pokuta úspěšně smazána');
        return true;
      } catch (error) {
        console.error('Error deleting pokuta:', error);
        toast.error('Chyba při mazání pokuty.');
        return false;
      }
    } else {
      console.log('Mazání pokuty zrušeno uživatelem');
      return false; // Uživatel zrušil mazání
    }
  };
  
  

  const addNewPokuta = async (e, nazev, castka) => {
    e.preventDefault();
    await addDoc(collection(firestore, 'pokuty'), {
      nazev,
      castka: Number(castka)
    });
    fetchPokuty();
    toast.success('Nová pokuta úspěšně přidána!');
  };

  const editPokuta = async (id, newNazev, newCastka) => {
    try {
      const pokutaDoc = doc(firestore, 'pokuty', id);
      await updateDoc(pokutaDoc, {
        nazev: newNazev,
        castka: Number(newCastka)
      });
      fetchPokuty();
      toast.success('Pokuta úspěšně upravena!');
    } catch (error) {
      console.error('Error updating pokuta:', error);
      toast.error('Chyba při úpravě pokuty.');
    }
  };

  const handlePaidAmountChange = (e, hracId) => {
    const value = e.target.value;
    setPaidAmounts({ ...paidAmounts, [hracId]: value });
  };

  const handleEditPaidAmount = (hracId) => {
    setPaidAmounts({ ...paidAmounts, [hracId]: '' }); // Nastavíme prázdnou hodnotu
    setEditPaidAmountId(hracId);
  };

  const handleSavePaidAmount = async (hracId) => {
    console.log(`Ukládám platbu pro hráče ID: ${hracId}, hodnota: ${paidAmounts[hracId]}`);
    
    // Kontrola, zda je hráč nalezen v lokálním stavu
    const hrac = hraci.find(h => h.id === hracId);
    if (!hrac) {
      console.error(`Hráč s ID ${hracId} nebyl nalezen`);
      toast.error('Hráč nebyl nalezen');
      return;
    }

    // Kontrola, zda je hodnota k přidání validní
    const amountToAdd = parseFloat(paidAmounts[hracId]);
    if (isNaN(amountToAdd) || amountToAdd === 0) {
      console.log('Platba je prázdná nebo 0, přeskakuji uložení');
      setPaidAmounts(prevState => ({
        ...prevState,
        [hracId]: ''
      }));
      return;
    }

    try {
      // Nacházíme aktuální document v Firestore
      const hracDoc = doc(firestore, 'hraci', hracId);
      const hracSnapshot = await getDoc(hracDoc);
      
      if (!hracSnapshot.exists()) {
        console.error(`Dokument pro hráče ${hracId} neexistuje v Firestore`);
        toast.error('Hráč neexistuje v databázi');
        return;
      }
      
      const currentData = hracSnapshot.data();
      const currentZaplatil = currentData.zaplatil || 0;
      
      // Výpočet nové částky
      console.log(`Aktuální částka zaplatil: ${currentZaplatil}, přidávám: ${amountToAdd}`);
      const newZaplatil = Math.max(0, currentZaplatil + amountToAdd);
      
      console.log(`Nová celková částka: ${newZaplatil}`);
      
      // Aktualizace Firestore dokumentu - POUZE s hodnotou zaplatil, nic jiného neměníme
      await updateDoc(hracDoc, { 
        zaplatil: newZaplatil 
      });
      
      // Okamžitě aktualizujeme i lokální stav pro zajištění konzistence
      setHraci(prevHraci => 
        prevHraci.map(h => 
          h.id === hracId ? { ...h, zaplatil: newZaplatil } : h
        )
      );
      
      console.log(`Platba byla úspěšně uložena pro hráče ${hrac.jmeno}`);
      
      if (amountToAdd > 0) {
        toast.success(`Přidáno ${amountToAdd} Kč pro hráče ${hrac.jmeno}`);
      } else {
        toast.success(`Odebráno ${Math.abs(amountToAdd)} Kč hráči ${hrac.jmeno}`);
      }
      
      // Reset formuláře
      setPaidAmounts(prevState => ({
        ...prevState,
        [hracId]: ''
      }));
      
      // Po uložení načteme aktuální data hráčů
      await fetchSpecificHrac(hracId);
      
    } catch (error) {
      console.error('Chyba při ukládání platby:', error);
      toast.error('Nastala chyba při ukládání platby');
    }
  };
  
  // Nová funkce pro načtení pouze konkrétního hráče místo všech
  const fetchSpecificHrac = async (hracId) => {
    console.log(`Načítám aktualizovaná data pro hráče ID: ${hracId}`);
    try {
      // Použijeme novou funkci z firebaseService
      const updatedHracData = await fetchSpecificHracData(hracId);
      
      if (updatedHracData) {
        // Aktualizujeme pouze tohoto hráče v seznamu
        setHraci(prevHraci => 
          prevHraci.map(h => h.id === hracId ? updatedHracData : h)
        );
        
        console.log(`Data hráče ${updatedHracData.jmeno} byla aktualizována`);
      }
    } catch (error) {
      console.error(`Chyba při načítání dat hráče ${hracId}:`, error);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/warriors-kasa');
  };

  const handlePhotoUpload = async (event, hracId) => {
    console.log(`Nahrávám fotografii pro hráče ID: ${hracId}`);
    const file = event.target.files[0];
    if (file) {
      try {
        // Nahrání souboru do Firebase Storage
        const storageRef = ref(storage, `player_photos/${hracId}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);

        console.log(`Fotografie úspěšně nahrána, aktualizuji URL v databázi`);
        
        // Aktualizace URL v databázi
        const hracDoc = doc(firestore, 'hraci', hracId);
        await updateDoc(hracDoc, {
          photoURL
        });
        
        // Načtení aktualizovaných dat hráče
        await fetchSpecificHrac(hracId);
        
        toast.success('Fotografie hráče byla úspěšně nahrána!');
      } catch (error) {
        console.error('Chyba při nahrávání fotografie:', error);
        toast.error('Nastala chyba při nahrávání fotografie.');
      }
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <Header
        isEvidencePage={isEvidencePage}
        setIsEvidencePage={setIsEvidencePage}
        user={user}
        handleLogout={handleLogout}
        activePage={activePage}
        setActivePage={setActivePage}
        addHrac={addHrac}
        newHrac={newHrac}
        setNewHrac={setNewHrac}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/warriors-kasa" />} />
        <Route path="/warriors-kasa" element={
          <>
            {user ? (
              <>
                {activePage === 'evidence' && (
                  <>
                    <PlayerFormShadcn hraci={hraci} pokuty={pokuty} addPokuta={addPokuta} />
                    <PlayerTable
                      hraci={hraci}
                      editHracId={editHracId}
                      editHracJmeno={editHracJmeno}
                      setEditHracId={setEditHracId}
                      setEditHracJmeno={setEditHracJmeno}
                      updateHrac={updateHrac}
                      deleteHrac={deleteHrac}
                      deletePokutaByIndex={deletePokutaByIndex}
                      editPaidAmountId={editPaidAmountId}
                      setEditPaidAmountId={setEditPaidAmountId}
                      handlePaidAmountChange={handlePaidAmountChange}
                      handleSavePaidAmount={handleSavePaidAmount}
                      paidAmounts={paidAmounts}
                      setPaidAmounts={setPaidAmounts}
                      handlePhotoUpload={handlePhotoUpload}
                      handleEditPaidAmount={handleEditPaidAmount}
                      setHraci={setHraci}
                    />
                  </>
                )}
                {activePage === 'penalties' && (
                  <>
                    <PenaltyForm addNewPokuta={addNewPokuta} />
                    <PenaltyTable
                      pokuty={pokuty}
                      deletePokuta={deletePokuta}
                      editPokuta={editPokuta}
                    />
                  </>
                )}
                {activePage === 'payment' && (
                  <Platba />
                )}
              </>
            ) : (
              <>
                {activePage === 'evidence' && <PublicView hraci={hraci} />}
                {activePage === 'penalties' && <PublicPenalties pokuty={pokuty} />}
                {activePage === 'payment' && <Platba />}
              </>
            )}
          </>
        } />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default AppContent; 