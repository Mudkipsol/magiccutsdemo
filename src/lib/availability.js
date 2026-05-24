// Shared slot-availability logic used by both the booking UI (Step3Calendar)
// and the AI Receptionist's get_availability tool. Single source of truth.
import { getDay, isBefore, startOfDay } from 'date-fns'

// Sundays closed by default (getDay index 0)
export const CLOSED_DAYS = [0]

// Half-hour slots from 10:00–18:30 (last slot starts at 18:30)
export const ALL_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
]

export function to12h(t) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

// Convert JS getDay() (0=Sun) to Monday-first index (0=Mon … 6=Sun)
export const mondayIdx = (date) => (getDay(date) + 6) % 7

// Given a barber's schedule array (7-item Mon-first) and a JS Date, return
// the schedule entry for that day, or null if no schedule is set.
export const dayEntry = (schedule, date) =>
  Array.isArray(schedule) && schedule.length === 7 ? schedule[mondayIdx(date)] : null

// Is this calendar day disabled for booking? Handles past, barber off days,
// and the shop default (closed Sundays).
export function isDisabled(date, schedule) {
  if (isBefore(date, startOfDay(new Date()))) return true
  const entry = dayEntry(schedule, date)
  if (entry) return !entry.working
  return CLOSED_DAYS.includes(getDay(date))
}

// Return the available time slots for a given date, bounded by the barber's
// schedule hours. Excludes already-booked slots.
export function getAvailableSlots(date, schedule, bookedSlots = []) {
  const entry = dayEntry(schedule, date)
  let slots
  if (!entry) {
    slots = ALL_SLOTS
  } else if (!entry.working) {
    return []
  } else {
    slots = ALL_SLOTS.filter((t) => t >= entry.open && t < entry.close)
  }
  return slots.filter((s) => !bookedSlots.includes(s))
}
