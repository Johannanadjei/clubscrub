import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import BookingFlow from './pages/BookingFlow.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AssistantApp from './pages/Assistant.jsx'
import Admin from './pages/Admin.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import AssistantAgreement from './pages/AssistantAgreement.jsx'
import Contact from './pages/Contact.jsx'
import Membership from './pages/Membership.jsx'
import MembershipApply from './pages/MembershipApply.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminGate from './components/AdminGate.jsx'

// Scrolls to the top of the page on every route change. Placed as a sibling
// of <Routes> (not inside it — Routes only accepts <Route> children).
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/book" element={<BookingFlow />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/assistant" element={<AssistantApp />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/assistant-agreement" element={<AssistantAgreement />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/membership" element={<Membership />} />
      <Route path="/membership/apply" element={<MembershipApply />} />
      <Route path="/admin" element={<AdminGate><Admin /></AdminGate>} />
      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
