import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';

const PlayerForm = ({ hraci, pokuty, addPokuta }) => {
  const [selectedHraci, setSelectedHraci] = useState([]);
  const [selectedPokuta, setSelectedPokuta] = useState(null);
  const [isPlayOff, setIsPlayOff] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedHraci.length === 0) {
      toast.error('Prosím vyberte alespoň jednoho hráče.');
      return;
    }
    if (!selectedPokuta) {
      toast.error('Prosím vyberte pokutu.');
      return;
    }

    const hracIds = selectedHraci.map(hrac => hrac.value);
    const pokutaAmount = isPlayOff ? selectedPokuta.castka * 2 : selectedPokuta.castka;
    
    addPokuta(hracIds, { 
      nazev: `${selectedPokuta.label}${isPlayOff ? ' (PO: x2)' : ''}`, 
      castka: pokutaAmount, 
      originalCastka: selectedPokuta.castka,
      datum: new Date().toLocaleDateString('cs-CZ'),
      isPlayOff: isPlayOff
    });
    
    setSelectedHraci([]);
    setSelectedPokuta(null);
    setIsPlayOff(false);
  };

  const hraciOptions = [
    { value: 'select_all', label: 'Vybrat všechny' },
    ...hraci.map(hrac => ({
      value: hrac.id,
      label: hrac.jmeno
    }))
  ];

  const pokutyOptions = pokuty.map(pokuta => ({
    value: pokuta.id,
    label: pokuta.nazev,
    castka: pokuta.castka
  }));

  const handleHraciChange = (selectedOptions) => {
    if (selectedOptions.some(option => option.value === 'select_all')) {
      setSelectedHraci(hraciOptions.slice(1)); // Vyber všechny hráče kromě "Vybrat všechny"
    } else {
      setSelectedHraci(selectedOptions);
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <Select
        isMulti
        value={selectedHraci}
        onChange={handleHraciChange}
        options={hraciOptions}
        placeholder="Vyber hráče"
        classNamePrefix="custom-select"
      />
      <Select
        value={selectedPokuta}
        onChange={setSelectedPokuta}
        options={pokutyOptions}
        placeholder="Vyber pokutu"
        classNamePrefix="custom-select"
      />
      <div className="playoff-checkbox">
        <label className={`custom-checkbox ${isPlayOff ? 'checked' : ''}`}>
          <input
            type="checkbox"
            checked={isPlayOff}
            onChange={(e) => setIsPlayOff(e.target.checked)}
          />
          <span className="checkmark"></span>
          <span className="label-text">PLAY-OFF (x2)</span>
        </label>
      </div>
      <button className="add-button" type="submit">Přidat pokutu</button>
    </form>
  );
};

export default PlayerForm;
