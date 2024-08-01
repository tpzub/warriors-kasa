// src/components/PublicPenalties.js
import React from 'react';

const PublicPenalties = ({ pokuty }) => {
  return (
    <><div className="table-container">
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
    <div className='penalties-notice'>
      <ul>
        <li><span className='bold-text'>Menší tresty se sčítají!</span></li>
        <li><span className='bold-text'>Play-off x2!</span> (neplatí pro pozitivní věci jako gól, asistence, atd.)</li>
      </ul>
    </div>
    </>
  );
};

export default PublicPenalties;
