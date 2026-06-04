import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n.js';
import App from './App.jsx';
import '../styles.css';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
