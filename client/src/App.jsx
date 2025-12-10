import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VCardTemplates from './components/VCardTemplates';
import DeviceFrame from './components/DeviceFrame';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VCardTemplates />} />
        
        {/* Simulator Page: Opens when you click a template */}
        {/* <Route path="/simulate" element={<SimulatorPage />} /> */}
                <Route path="/device" element={<DeviceFrame />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;