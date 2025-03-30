import { firestore } from '../firebase/firebaseConfig';
import { collection, getDocs, increment, doc, updateDoc, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

// Funkce pro aktualizaci hráče
export const updateHracData = async (hracId, data) => {
  try {
    if (!hracId) {
      console.error('Chybí ID hráče k aktualizaci');
      toast.error('Chyba: Chybí ID hráče');
      return false;
    }
    
    console.log(`Aktualizuji hráče s ID: ${hracId}, data:`, data);
    
    const hracDoc = doc(firestore, 'hraci', hracId);
    await updateDoc(hracDoc, data);
    return true;
  } catch (error) {
    console.error('Chyba při aktualizaci hráče:', error);
    toast.error('Nastala chyba při aktualizaci hráče.');
    return false;
  }
};

// Funkce pro načtení konkrétního hráče
export const fetchSpecificHracData = async (hracId) => {
  console.log(`Načítám data pro hráče ID: ${hracId}`);
  try {
    const hracDoc = doc(firestore, 'hraci', hracId);
    const hracSnapshot = await getDoc(hracDoc);
    
    if (hracSnapshot.exists()) {
      return { id: hracId, ...hracSnapshot.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Chyba při načítání dat hráče ${hracId}:`, error);
    return null;
  }
};

// Funkce pro uložení platby
export const savePlayerPaymentData = async (hracId, amount) => {
  try {
    console.log(`Ukládám částku ${amount} pro hráče ${hracId}`);
    
    if (!hracId || isNaN(amount) || amount === 0) {
      console.log('Neplatná data pro uložení platby');
      return false;
    }
    
    // Nejprve načteme aktuální data hráče
    const hrac = await fetchSpecificHracData(hracId);
    
    if (!hrac) {
      console.error(`Hráč s ID ${hracId} nebyl nalezen`);
      toast.error('Hráč nebyl nalezen');
      return false;
    }
    
    const currentZaplatil = hrac.zaplatil || 0;
    const newZaplatil = Math.max(0, currentZaplatil + amount);
    
    console.log(`Aktuální zaplaceno: ${currentZaplatil}, nová hodnota: ${newZaplatil}`);
    
    // Aktualizujeme hodnotu v Firestore
    const result = await updateHracData(hracId, { zaplatil: newZaplatil });
    
    if (result) {
      return {
        success: true,
        prevAmount: currentZaplatil,
        newAmount: newZaplatil,
        difference: amount
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error('Chyba při ukládání platby:', error);
    return { success: false, error };
  }
}; 