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
    <><div className="table-container">
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
                    onChange={(e) => setNewNazev(e.target.value)} />
                ) : (
                  pokuta.nazev
                )}
              </td>
              <td>
                {editing === pokuta.id ? (
                  <input
                    type="number"
                    value={newCastka}
                    onChange={(e) => setNewCastka(e.target.value)} />
                ) : (
                  `${pokuta.castka} Kč`
                )}
              </td>
              <td>
                {editing === pokuta.id ? (
                  <>
                    <span className='action-buttons'>
                      <button className="save-button" onClick={() => saveEditing(pokuta.id)}>Uložit</button>
                      <button className="cancel-button" onClick={cancelEditing}>Zpět</button>
                    </span>
                  </>
                ) : (
                  <>
                    <span className='action-buttons'>
                      <FaEdit className="icon edit-icon" onClick={() => startEditing(pokuta)} />
                      <FaTrashAlt className="icon delete-icon" onClick={() => deletePokuta(pokuta.id)} />
                    </span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className='penalties-notice'>
        <ul>
          <li><span className='bold-text'>Menší tresty se sčítají!</span></li>
          <li><span className='bold-text'>Play-off x2!</span> (neplatí pro pozitivní věci jako gól, asistence, atd.)</li>
        </ul>
      </div>
      </>
  );
};

export default PenaltyTable;
