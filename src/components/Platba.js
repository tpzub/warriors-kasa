import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Select from 'react-select';
import qrCode from '../assets/qr-kod.png';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.jsx";
import { Label } from "./ui/label.jsx";
import { cn } from "../lib/utils.js";
import { ChevronDown } from "lucide-react";

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

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      borderColor: 'hsl(var(--border))',
      borderRadius: 'var(--radius)',
      padding: '1px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'rgb(209 213 219)', // hover:border-gray-300
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--popover))',
      borderRadius: 'var(--radius)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: '16px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'hsl(var(--accent))' 
        : state.isFocused 
          ? 'hsl(var(--muted))' 
          : 'hsl(var(--popover))',
      color: state.isSelected 
        ? 'hsl(var(--accent-foreground))' 
        : 'hsl(var(--popover-foreground))',
      fontSize: '14px',
      ':active': {
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))'
      }
    }),
    input: (provided) => ({
      ...provided,
      fontSize: '14px',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: '14px',
    }),
  };

  return (
    <div className="flex justify-center p-4 min-w-[320px]">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-sm mb-8">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-lg font-bold">Kolik dlužím? 💸</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player-select">Vyberte hráče</Label>
              <Select
                inputId="player-select"
                options={playerOptions}
                onChange={handlePlayerChange}
                placeholder="Vyberte hráče"
                styles={{
                  ...customSelectStyles,
                  container: (provided) => ({
                    ...provided,
                    width: '100%'
                  })
                }}
                className="text-foreground w-full"
              />
            </div>
            
            {selectedPlayer && (
              <div className="mt-4 text-center">
                {selectedPlayer.dluhCelkem - (selectedPlayer.zaplatil || 0) > 0 ? (
                  <div className="bg-red-50 p-3 rounded-md border border-red-200">
                    <p className="text-red-700 font-medium flex items-center justify-center text-sm">
                      <span className="mr-2">❗</span>
                      <span>{selectedPlayer.jmeno} dluží: <span className="font-bold">{selectedPlayer.dluhCelkem - (selectedPlayer.zaplatil || 0)} Kč</span></span>
                      <span className="ml-2">❗</span>
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <p className="text-green-700 font-medium flex items-center justify-center text-sm">
                      <span>{selectedPlayer.jmeno} nic nedluží</span>
                      <span className="ml-2">👍</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full shadow-sm mb-16">
          <CardHeader className="px-4 text-center">
            <CardTitle className="text-lg font-bold flex items-center justify-center">
              Zaplatit přes QR
              <ChevronDown className="ml-2" size={20} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 flex flex-col items-center">
            <img src={qrCode} alt="QR kód" className="qr-code max-w-[200px] my-2" />
            <p className="text-center mb-4 mt-4 text-sm">
              Peníze přijdou na <strong>Šnajdyho účet</strong> a až přijdou, tak se zapíšou do tabulky 💪
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Platba;
