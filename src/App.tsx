/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Chat from './components/Chat';
import Profile from './components/Profile';
import History from './components/History';
import Booking from './components/Booking';
import MyBookings from './components/MyBookings';
import HealthMap from './components/HealthMap';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analysis" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/history" element={<History />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/map" element={<HealthMap />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
