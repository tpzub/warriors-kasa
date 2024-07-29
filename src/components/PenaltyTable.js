import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';

const PenaltyTable = ({ pokuty, deletePokuta }) => {
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
              <td>{pokuta.nazev}</td>
              <td>{pokuta.castka} Kč</td>
              <td>
                <FaTrashAlt className="icon delete-icon" onClick={() => deletePokuta(pokuta.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PenaltyTable;
