import { useState, useEffect, useCallback } from 'react'
import { MOCK_BOOKINGS, MOCK_ASSISTANTS } from '../data/index.js'

function useLocalState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch { return initial }
  })
  const set = useCallback((v) => {
    setValue(prev => {
      const next = typeof v === 'function' ? v(prev) : v
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }, [key])
  return [value, set]
}

export function useBookings() {
  const [bookings, setBookings] = useLocalState('cs_bookings', MOCK_BOOKINGS)
  const addBooking = (b) => setBookings(prev => [b, ...prev])
  const updateBooking = (id, updates) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  const cancelBooking = (id) => updateBooking(id, { status: 'cancelled' })
  return { bookings, addBooking, updateBooking, cancelBooking }
}

export function useAssistants() {
  const [assistants, setAssistants] = useLocalState('cs_assistants', MOCK_ASSISTANTS)
  const addAssistant = (a) => setAssistants(prev => [a, ...prev])
  const updateAssistant = (id, updates) =>
    setAssistants(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  return { assistants, addAssistant, updateAssistant }
}

export function useAssistantProfile() {
  const [profile, setProfile] = useLocalState('cs_assistant_profile', null)
  return [profile, setProfile]
}
