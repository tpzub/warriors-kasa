// src/components/PublicPenalties.js
import React from 'react';

const PublicPenalties = ({ pokuty }) => {
  return (
    <div className="table-container">
      <h2 className="center-text">Přehled pokut</h2>
      <table className="evidence-table-penalties">
        <thead>
          <tr>
            <th>#</th>
            <th>Název pokuty</th>
            <th>Částka</th>
          </tr>
        </thead>
        <tbody>
          {pokuty.map((pokuta, index) => (
            <tr key={pokuta.id}>
              <td>{index + 1}</td>
              <td>{pokuta.nazev}</td>
              <td>{pokuta.castka} Kč</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PublicPenalties;
