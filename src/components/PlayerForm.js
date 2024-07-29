import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';

const PlayerForm = ({ hraci, pokuty, addPokuta }) => {
  const [selectedHraci, setSelectedHraci] = useState([]);
  const [selectedPokuta, setSelectedPokuta] = useState(null);

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
    addPokuta(hracIds, { nazev: selectedPokuta.label, castka: selectedPokuta.castka, datum: new Date().toLocaleDateString() });
    
    setSelectedHraci([]);
    setSelectedPokuta(null);
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
    label: `${pokuta.nazev} - ${pokuta.castka} Kč`,
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
      <button className="add-button" type="submit">Přidat pokutu</button>
    </form>
  );
};

export default PlayerForm;
