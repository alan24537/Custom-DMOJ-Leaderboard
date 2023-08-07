// App.js
import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import TablePage from './pages/TablePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route path="/admin" element={<Admin/>} />
        <Route path="/leaderboard/:tableId" element={<TablePage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
