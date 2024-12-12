import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Start from './components/pages/Start';
import Leagues from './components/pages/Leagues';
import Teams from './components/pages/Teams';
import International from './components/pages/International';
import Live from './components/pages/Live';
import SceneManager from './components/SceneManager';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <SceneManager>
    <BrowserRouter>
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/leagues" element={<Leagues />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/international" element={<International />} />
            <Route path="/live" element={<Live />} />
          </Routes>
      </BrowserRouter>
    </SceneManager>
);