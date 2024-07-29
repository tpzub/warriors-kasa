import React, { useState } from 'react';

const PenaltyForm = ({ addNewPokuta }) => {
  const [nazev, setNazev] = useState('');
  const [castka, setCastka] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nazev || !castka) {
      alert('Prosím vyplňte název a částku pokuty.');
      return;
    }
    addNewPokuta(e, nazev, castka);
    setNazev('');
    setCastka('');
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input
        type="text"
        value={nazev}
        onChange={(e) => setNazev(e.target.value)}
        placeholder="Název pokuty"
      />
      <input
        type="number"
        value={castka}
        onChange={(e) => setCastka(e.target.value)}
        placeholder="Částka pokuty"
      />
      <button type="submit" className="add-button">Přidat pokutu</button>
    </form>
  );
};

export default PenaltyForm;
