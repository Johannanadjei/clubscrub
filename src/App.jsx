import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import BookingFlow from './pages/BookingFlow.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AssistantApp from './pages/Assistant.jsx'
import Admin from './pages/Admin.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import AssistantAgreement from './pages/AssistantAgreement.jsx'
import Contact from './pages/Contact.jsx'
import AdminGate from './components/AdminGate.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/book" element={<BookingFlow />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/assistant" element={<AssistantApp />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/assistant-agreement" element={<AssistantAgreement />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin" element={<AdminGate><Admin /></AdminGate>} />
    </Routes>
  )
}
