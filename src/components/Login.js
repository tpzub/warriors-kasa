import React, { useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast.success('Přihlášení úspěšné');
      })
      .catch((error) => {
        console.error('Chyba při přihlášení:', error);
        toast.error('Špatné heslo nebo email');
      });
  };

  return (
    <div className="login-container">
      <h2>Přihlášení administrátora</h2>
      <form onSubmit={onSubmit} className="login-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Heslo"
          required
        />
        <button type="submit">Přihlásit se</button>
      </form>
    </div>
  );
};

export default Login;
