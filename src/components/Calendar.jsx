import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toYmd, parseLocalDate, SUNDAY_SURCHARGE } from '../data/index.js'

// Custom booking calendar (CLAUDE.md: never use a plain <input type="date">).
// Enforces, visually:
//   - No past dates + 24h minimum notice  → earliest selectable is tomorrow
//   - 60-day advance limit
//   - Saturdays closed (greyed out, struck through, unselectable)
//   - Sundays bookable but flagged with a pink dot (weekend surcharge)

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export default function Calendar({ value, onChange }) {
  const today = startOfDay(new Date())
  // 24h minimum notice → earliest bookable day is tomorrow.
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  // 60-day advance limit.
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60)

  const initial = (value && parseLocalDate(value)) || minDate
  const [view, setView] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevDisabled = year < minDate.getFullYear() ||
    (year === minDate.getFullYear() && month <= minDate.getMonth())
  const nextDisabled = year > maxDate.getFullYear() ||
    (year === maxDate.getFullYear() && month >= maxDate.getMonth())

  const goPrev = () => !prevDisabled && setView(new Date(year, month - 1, 1))
  const goNext = () => !nextDisabled && setView(new Date(year, month + 1, 1))

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const navBtn = (disabled) => ({
    width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)',
    color: disabled ? 'rgba(255,255,255,0.2)' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer', WebkitTapHighlightColor: 'transparent',
  })

  return (
    <div>
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" aria-label="Previous month" onClick={goPrev} disabled={prevDisabled} style={navBtn(prevDisabled)}>
          <ChevronLeft size={16} />
        </button>
        <p className="font-display italic" style={{ fontSize: 18, fontWeight: 600 }}>
          {MONTHS[month]} {year}
        </p>
        <button type="button" aria-label="Next month" onClick={goNext} disabled={nextDisabled} style={navBtn(nextDisabled)}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500, paddingBottom: 2 }}>
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`b${i}`} />
          const dow = date.getDay()
          const ymd = toYmd(date)
          const isSat = dow === 6
          const isSun = dow === 0
          const outOfRange = date < minDate || date > maxDate
          const disabled = isSat || outOfRange
          const selected = value === ymd

          const title = isSat
            ? "We're closed on Saturdays"
            : isSun ? `Weekend surcharge: +GH₵ ${SUNDAY_SURCHARGE}` : undefined

          return (
            <button
              key={ymd}
              type="button"
              onClick={() => !disabled && onChange(ymd)}
              disabled={disabled}
              title={title}
              aria-label={`${ymd}${isSat ? ' (closed)' : isSun ? ` (weekend surcharge GH₵ ${SUNDAY_SURCHARGE})` : ''}`}
              aria-pressed={selected}
              style={{
                position: 'relative',
                minHeight: 44, minWidth: 44, borderRadius: 12,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                border: selected ? 'none' : '0.5px solid rgba(255,255,255,0.08)',
                background: selected ? '#EC2461' : disabled ? 'transparent' : 'rgba(255,255,255,0.03)',
                color: selected ? '#fff'
                  : isSat ? 'rgba(255,255,255,0.2)'
                  : outOfRange ? 'rgba(255,255,255,0.18)'
                  : '#fff',
                textDecoration: isSat ? 'line-through' : 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                WebkitTapHighlightColor: 'transparent',
                transition: 'background 0.15s',
              }}
            >
              {date.getDate()}
              {/* Sunday surcharge indicator (only on selectable Sundays) */}
              {isSun && !outOfRange && (
                <span style={{
                  position: 'absolute', bottom: 6,
                  width: 4, height: 4, borderRadius: '50%',
                  background: selected ? '#fff' : '#EC2461',
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3" style={{ flexWrap: 'wrap' }}>
        <div className="flex items-center gap-1.5">
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EC2461', display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
            Sunday · weekend surcharge +GH₵ {SUNDAY_SURCHARGE}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 300, textDecoration: 'line-through' }}>
          Saturday · closed
        </span>
      </div>
    </div>
  )
}
