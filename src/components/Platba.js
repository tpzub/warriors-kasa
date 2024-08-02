import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Select from 'react-select';
import qrCode from '../assets/qr-kod.png';

const Platba = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      const playersCollection = await getDocs(collection(firestore, 'hraci'));
      let playersData = playersCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort players alphabetically by name
      playersData = playersData.sort((a, b) => a.jmeno.localeCompare(b.jmeno));
      setPlayers(playersData);
    };

    fetchPlayers();
  }, []);

  const handlePlayerChange = (selectedOption) => {
    const player = players.find(p => p.id === selectedOption.value);
    setSelectedPlayer(player);
  };

  const playerOptions = players.map(player => ({
    value: player.id,
    label: player.jmeno
  }));

  return (
    <>
      <h2 className='center-text'>Zaplatit pokuty</h2>
      <div className="platba-container">
        <div className="qr-content">
          <img src={qrCode} alt="QR kód" className="qr-code" />
          <div className="qr-text">Peníze přijdou na <strong>Šnajdyho účet</strong> a až přijdou, tak se zapíšou do tabulky 💪</div>
        </div>
        <div className='kolik-dluzim-container'>
          <div className='kolik-dluzim'>
            <h4>Kolik dlužím?</h4>
            <Select
              options={playerOptions}
              onChange={handlePlayerChange}
              placeholder="Vyberte hráče"
            />
            {selectedPlayer && (
              <div className="player-info">
                {selectedPlayer.dluhCelkem > 0 ? (
                  <div className="debt-notice1">❗ ještě dluží: <strong>{selectedPlayer.dluhCelkem} Kč ❗</strong></div>
                ) : (
                  <div className="debt-notice2">nic nedluží 👍</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Platba;
