import { create } from 'zustand'

export const useBookingStore = create((set, get) => ({
  step: 1,           // 1-6
  service: null,     // services[n]
  barber: null,      // barbers[n]
  date: null,        // 'YYYY-MM-DD'
  time: null,        // 'HH:MM'
  contact: null,     // { name, email, phone, notes }
  paymentIntent: null,
  appointmentId: null,

  setStep: (step) => set({ step }),
  setService: (s) => set({ service: s, step: 2 }),
  setBarber: (b) => set({ barber: b, step: 3 }),
  setDateTime: (date, time) => set({ date, time, step: 4 }),
  setContact: (c) => set({ contact: c, step: 5 }),
  setPaymentIntent: (pi) => set({ paymentIntent: pi }),
  setAppointmentId: (id) => set({ appointmentId: id, step: 6 }),

  reset: () => set({
    step: 1, service: null, barber: null, date: null,
    time: null, contact: null, paymentIntent: null, appointmentId: null,
  }),
}))
