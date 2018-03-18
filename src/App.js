import React from 'react';
import logo from './logo.svg';
import './App.css';
import Mine from './Mine/index';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Can you win the game?</h1>
      </header>
      <Mine />
    </div>
  );
}

export default App;
