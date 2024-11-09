// src/components/PublicPenalties.js
import React from 'react';

const PublicPenalties = ({ pokuty }) => {
  return (
    <>
      <div className="table-container">
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
      <div className='penalties-notice'>
        <ul>
          <li>Menší tresty se sčítají!</li>
          <li>Play-off x2! (neplatí pro pozitivní věci jako gól, asistence, atd.)</li>
        </ul>
      </div>
    </>
  );
};

export default PublicPenalties;
