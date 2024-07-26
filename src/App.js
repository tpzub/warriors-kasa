import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebase/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Header from './components/Header';
import PlayerForm from './components/PlayerForm';
import PenaltyForm from './components/PenaltyForm';
import PlayerTable from './components/PlayerTable';
import PenaltyTable from './components/PenaltyTable';
import Login from './components/Login';
import PublicView from './components/PublicView';
import PublicPenalties from './components/PublicPenalties';
import { collection, getDocs, arrayUnion, increment, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const [user, loading, error] = useAuthState(auth);
  const [hraci, setHraci] = useState([]);
  const [pokuty, setPokuty] = useState([]);
  const [newHrac, setNewHrac] = useState('');
  const [editHracId, setEditHracId] = useState(null);
  const [editHracJmeno, setEditHracJmeno] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [paidAmounts, setPaidAmounts] = useState({});
  const [isEvidencePage, setIsEvidencePage] = useState(true);
  const [editPaidAmountId, setEditPaidAmountId] = useState(null);
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
    if (user) {
      console.log('User is logged in:', user);
      fetchHraci();
      fetchPokuty();
      navigate('/admin');
    } else {
      console.log('User is not logged in.');
      fetchHraci();
      fetchPokuty();
    }
  }, [user, loading, error, navigate]);

  const fetchHraci = async () => {
    const hraciCollection = await getDocs(collection(firestore, 'hraci'));
    const hraciData = hraciCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    hraciData.sort((a, b) => a.jmeno.localeCompare(b.jmeno));
    setHraci(hraciData);
    const paidAmountsData = {};
    hraciData.forEach(hrac => {
      paidAmountsData[hrac.id] = hrac.zaplatil || 0;
    });
    setPaidAmounts(paidAmountsData);
  };

  const fetchPokuty = async () => {
    const pokutyCollection = await getDocs(collection(firestore, 'pokuty'));
    let pokutyData = pokutyCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    pokutyData = pokutyData.sort((a, b) => a.castka - b.castka); // Seřadit podle hodnoty
    setPokuty(pokutyData);
  };

  const addPokuta = async (hracIds, pokuta) => {
    const selectedPokuta = { ...pokuta, datum: new Date().toLocaleDateString() };
    const hraciData = [...hraci];
  
    for (let hracId of hracIds) {
      const hracDoc = doc(firestore, 'hraci', hracId);
      const hracIndex = hraciData.findIndex(hrac => hrac.id === hracId);
      if (hracIndex === -1) {
        console.error(`Hráč s ID ${hracId} nebyl nalezen.`);
        continue;
      }
      const hracDataItem = hraciData[hracIndex];
      const updatedPokuty = [...hracDataItem.pokuty, selectedPokuta];
  
      await updateDoc(hracDoc, {
        pokuty: arrayUnion(selectedPokuta),
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
      zaplatil: 0
    });
    setNewHrac('');
    fetchHraci();
    toast.success('Hráč úspěšně přidán!');
  };

  const updateHrac = async (e) => {
    e.preventDefault();
    const hracDoc = doc(firestore, 'hraci', editHracId);
    await updateDoc(hracDoc, {
      jmeno: editHracJmeno
    });
    setEditHracId(null);
    setEditHracJmeno('');
    fetchHraci();
    toast.success('Hráč úspěšně aktualizován!');
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
    if (window.confirm('Opravdu chcete smazat tuto pokutu?')) {
      const hracDoc = doc(firestore, 'hraci', hracId);
      const hracData = hraci.find(h => h.id === hracId);
      const pokutaToDelete = hracData.pokuty[index];
      const updatedPokuty = hracData.pokuty.filter((_, i) => i !== index);
      await updateDoc(hracDoc, {
        pokuty: updatedPokuty,
        dluhCelkem: increment(-pokutaToDelete.castka)
      });
      fetchHraci();
      toast.success('Pokuta úspěšně smazána!');
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

  const handlePaidAmountChange = (e, hracId) => {
    const value = e.target.value;
    setPaidAmounts({ ...paidAmounts, [hracId]: value });
  };

  const handleSavePaidAmount = async (hracId) => {
    const hracDoc = doc(firestore, 'hraci', hracId);
    await updateDoc(hracDoc, {
      zaplatil: Number(paidAmounts[hracId])
    });
    setEditPaidAmountId(null);
    fetchHraci();
    toast.success('Platba úspěšně aktualizována!');
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className="container">
      <ToastContainer />
      <Header
        isEvidencePage={isEvidencePage}
        setIsEvidencePage={setIsEvidencePage}
        user={user}
        handleLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={isEvidencePage ? <PublicView hraci={hraci} /> : <PublicPenalties pokuty={pokuty} />} />
        <Route path="/admin" element={
          user ? (
            isEvidencePage ? (
              <>
                <h2 className="center-text">Správa dluhů</h2>
                <PlayerForm hraci={hraci} pokuty={pokuty} addPokuta={addPokuta} />
                <PlayerTable
                  hraci={hraci}
                  editMode={editMode}
                  editHracId={editHracId}
                  editHracJmeno={editHracJmeno}
                  setEditHracId={setEditHracId}
                  setEditHracJmeno={setEditHracJmeno}
                  updateHrac={updateHrac}
                  deleteHrac={deleteHrac}
                  deletePokuta={deletePokuta}
                  deletePokutaByIndex={deletePokutaByIndex}
                  editPaidAmountId={editPaidAmountId}
                  setEditPaidAmountId={setEditPaidAmountId}
                  handlePaidAmountChange={handlePaidAmountChange}
                  handleSavePaidAmount={handleSavePaidAmount}
                  paidAmounts={paidAmounts}
                  addHrac={addHrac}
                  newHrac={newHrac}
                  setNewHrac={setNewHrac}
                />
              </>
            ) : (
              <>
                <h2 className="center-text">Správa pokut</h2>
                <PenaltyForm addNewPokuta={addNewPokuta} />
                <PenaltyTable
                  pokuty={pokuty}
                  deletePokuta={deletePokuta}
                />
              </>
            )
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App;
