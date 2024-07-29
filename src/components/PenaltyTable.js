import React, { useState } from 'react';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';

const PenaltyTable = ({ pokuty, deletePokuta, editPokuta }) => {
  const [editing, setEditing] = useState(null);
  const [newNazev, setNewNazev] = useState('');
  const [newCastka, setNewCastka] = useState('');

  const startEditing = (pokuta) => {
    setEditing(pokuta.id);
    setNewNazev(pokuta.nazev);
    setNewCastka(pokuta.castka);
  };

  const saveEditing = (id) => {
    editPokuta(id, newNazev, newCastka);
    setEditing(null);
    setNewNazev('');
    setNewCastka('');
  };

  const cancelEditing = () => {
    setEditing(null);
    setNewNazev('');
    setNewCastka('');
  };

  return (
    <div className="table-container">
      <table className="evidence-table-penalties">
        <thead>
          <tr>
            <th>#</th>
            <th>Název pokuty</th>
            <th>Částka</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {pokuty.map((pokuta, index) => (
            <tr key={pokuta.id}>
              <td>{index + 1}</td>
              <td>
                {editing === pokuta.id ? (
                  <input
                    type="text"
                    value={newNazev}
                    onChange={(e) => setNewNazev(e.target.value)}
                  />
                ) : (
                  pokuta.nazev
                )}
              </td>
              <td>
                {editing === pokuta.id ? (
                  <input
                    type="number"
                    value={newCastka}
                    onChange={(e) => setNewCastka(e.target.value)}
                  />
                ) : (
                  `${pokuta.castka} Kč`
                )}
              </td>
              <td>
                {editing === pokuta.id ? (
                  <>
                    <button className="save-button" onClick={() => saveEditing(pokuta.id)}>Uložit</button>
                    <button className="cancel-button" onClick={cancelEditing}>Zpět</button>
                  </>
                ) : (
                  <>
                    <FaEdit className="icon edit-icon" onClick={() => startEditing(pokuta)} />
                    <FaTrashAlt className="icon delete-icon" onClick={() => deletePokuta(pokuta.id)} />
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PenaltyTable;
