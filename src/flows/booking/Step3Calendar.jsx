import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, getDay } from 'date-fns'
import { useBookingStore } from '../../store/bookingStore'
import { supabase } from '../../lib/supabase'

// Shop is closed Sundays (index 0)
const CLOSED_DAYS = [0]

// Default time slots
const ALL_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
]

function to12h(t) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

// Monday-first index for a JS date (getDay: 0=Sun … 6=Sat)
const mondayIdx = (date) => (getDay(date) + 6) % 7

export default function Step3Calendar() {
  const { barber, setDateTime } = useBookingStore()
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [schedule, setSchedule] = useState(null) // barber's weekly hours, or null = shop default
  const [loading, setLoading] = useState(false)

  // Load the selected barber's weekly schedule
  useEffect(() => {
    if (!barber || !supabase) { setSchedule(null); return }
    supabase
      .from('barbers')
      .select('schedule')
      .eq('id', barber.id)
      .single()
      .then(({ data }) => {
        const s = data?.schedule
        setSchedule(Array.isArray(s) && s.length === 7 ? s : null)
      })
  }, [barber])

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDate || !barber) { setBookedSlots([]); return }
    const fetch = async () => {
      setLoading(true)
      if (supabase) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const { data } = await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('barber_id', barber.id)
          .eq('appointment_date', dateStr)
          .in('status', ['pending', 'confirmed'])
        setBookedSlots((data || []).map((r) => r.appointment_time.slice(0, 5)))
      }
      setLoading(false)
    }
    fetch()
  }, [selectedDate, barber])

  const today = startOfDay(new Date())
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad start
  const startPad = getDay(monthStart) // 0=Sun
  const cells = [...Array(startPad).fill(null), ...days]

  // Which days/hours a barber works. Falls back to shop default (closed Sundays).
  const dayEntry = (day) => (schedule ? schedule[mondayIdx(day)] : null)

  const isDisabled = (day) => {
    if (isBefore(day, today)) return true
    const entry = dayEntry(day)
    if (entry) return !entry.working
    return CLOSED_DAYS.includes(getDay(day))
  }

  // Slots offered for the selected date, bounded by the barber's hours.
  const daySlots = (() => {
    if (!selectedDate) return ALL_SLOTS
    const entry = dayEntry(selectedDate)
    if (!entry) return ALL_SLOTS
    if (!entry.working) return []
    return ALL_SLOTS.filter((t) => t >= entry.open && t < entry.close)
  })()

  const confirm = () => {
    if (selectedDate && selectedTime) {
      setDateTime(format(selectedDate, 'yyyy-MM-dd'), selectedTime)
    }
  }

  const availableSlots = daySlots.filter((s) => !bookedSlots.includes(s))

  return (
    <div>
      <h1 className="font-display text-5xl font-bold uppercase text-bone">Pick a date & time</h1>
      <p className="mt-3 text-bone/60">
        Showing availability for{' '}
        <span className="text-gold-300">{barber?.name || 'any barber'}</span>.
        Closed Sundays.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto]">
        {/* Calendar */}
        <div className="rounded-[2px] border border-white/10 p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMonth((m) => subMonths(m, 1))}
              disabled={isBefore(subMonths(month, 1), today)}
              aria-label="Previous month"
              className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-white/15 font-display text-lg text-bone/60 transition-colors hover:border-gold-300/50 hover:text-gold-300 disabled:opacity-30"
            >
              ‹
            </button>
            <span className="font-display text-2xl font-bold uppercase text-bone">{format(month, 'MMMM yyyy')}</span>
            <button
              onClick={() => setMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
              className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-white/15 font-display text-lg text-bone/60 transition-colors hover:border-gold-300/50 hover:text-gold-300"
            >
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className="mt-5 grid grid-cols-7 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="py-2 font-mono text-[10px] uppercase tracking-widest text-bone/35">{d}</div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />
              const disabled = isDisabled(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isToday = isSameDay(day, today)
              return (
                <button
                  key={day.toISOString()}
                  disabled={disabled}
                  onClick={() => { setSelectedDate(day); setSelectedTime(null) }}
                  className={`relative flex h-10 w-full items-center justify-center rounded-[2px] font-mono text-sm transition-colors
                    ${disabled ? 'cursor-not-allowed text-bone/20' : 'hover:bg-gold-300/10 hover:text-bone'}
                    ${isSelected ? 'bg-gold-400 font-medium text-onyx-950' : ''}
                    ${isToday && !isSelected ? 'border border-gold-300/50 text-gold-300' : ''}
                    ${!isSelected && !disabled ? 'text-bone/80' : ''}
                  `}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time slots */}
        <AnimatePresence mode="wait">
          {selectedDate ? (
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="w-full rounded-[2px] border border-white/10 p-6 lg:w-64"
            >
              <p className="font-display text-xl font-bold uppercase text-bone">
                {format(selectedDate, 'EEEE, MMM d')}
              </p>
              <p className="mt-1 font-mono text-xs text-bone/40">{availableSlots.length} slots open</p>
              {loading ? (
                <p className="mt-4 font-mono text-sm text-bone/40">Loading…</p>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-1.5 lg:grid-cols-1">
                  {daySlots.length === 0 && (
                    <p className="col-span-2 text-sm text-bone/40 lg:col-span-1">
                      {barber?.name || 'This barber'} isn't working this day.
                    </p>
                  )}
                  {daySlots.map((t) => {
                    const booked = bookedSlots.includes(t)
                    const active = selectedTime === t
                    return (
                      <button
                        key={t}
                        disabled={booked}
                        onClick={() => setSelectedTime(t)}
                        className={`rounded-[2px] py-2.5 font-mono text-sm transition-colors ${
                          booked ? 'cursor-not-allowed text-bone/20 line-through' :
                          active ? 'bg-gold-400 font-medium text-onyx-950' :
                          'border border-white/15 text-bone/70 hover:border-gold-300/50 hover:text-gold-300'
                        }`}
                      >
                        {to12h(t)}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex w-full items-center justify-center rounded-[2px] border border-white/10 p-8 text-center text-bone/30 lg:w-64"
            >
              <p className="font-mono text-sm">Select a date to see available times</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedDate && selectedTime && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border-t border-gold-300/40 pt-5">
            <p className="font-mono text-sm text-bone/70">
              {format(selectedDate, 'EEEE, MMMM d')} at {to12h(selectedTime)}
              {barber && <> with {barber.name}</>}
            </p>
            <button onClick={confirm} className="btn-gold mt-4 w-full">
              Confirm date & time
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
