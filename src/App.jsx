import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import BookingFlow from './pages/BookingFlow.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AssistantApp from './pages/Assistant.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/book" element={<BookingFlow />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/assistant" element={<AssistantApp />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
