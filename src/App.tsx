import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import CRM from './pages/CRM';
import Finance from './pages/Finance';
import Contracts from './pages/Contracts';
import WebsiteEditor from './pages/WebsiteEditor';
import Settings from './pages/Settings';

// Public Site Components
import PublicLayout from './pages/public/PublicLayout';
import PublicHome from './pages/public/Home';
import PublicInventory from './pages/public/Inventory';
import PublicAbout from './pages/public/About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        } />
        <Route path="/inventory" element={
          <DashboardLayout>
            <Inventory />
          </DashboardLayout>
        } />
        <Route path="/crm" element={
          <DashboardLayout>
            <CRM />
          </DashboardLayout>
        } />
        <Route path="/finance" element={
          <DashboardLayout>
            <Finance />
          </DashboardLayout>
        } />
        <Route path="/contracts" element={
          <DashboardLayout>
            <Contracts />
          </DashboardLayout>
        } />
        <Route path="/website-editor" element={
          <DashboardLayout>
            <WebsiteEditor />
          </DashboardLayout>
        } />
        <Route path="/settings" element={
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        } />

        {/* Public Site Routes (Simulating a dealership domain) */}
        <Route path="/site" element={<PublicLayout />}>
          <Route index element={<PublicHome />} />
          <Route path="estoque" element={<PublicInventory />} />
          <Route path="sobre" element={<PublicAbout />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
