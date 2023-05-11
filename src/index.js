import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAMUXg42dw96mfuyNQCdPIN7bqxkpInxvA",
  authDomain: "padawans115-frontend-shop.firebaseapp.com",
  projectId: "padawans115-frontend-shop",
  storageBucket: "padawans115-frontend-shop.appspot.com",
  messagingSenderId: "324028544683",
  appId: "1:324028544683:web:5b16fe73c554e8a99fa9ee",
  databaseURL: 'https://padawans115-frontend-shop-default-rtdb.firebaseio.com/'
};


initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
