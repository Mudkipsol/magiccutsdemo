import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBookingStore = create(
  persist(
    (set) => ({
      step: 1,
      service: null,
      barber: null,
      date: null,
      time: null,
      contact: null,
      paymentIntent: null,
      appointmentId: null,

      setStep: (step) => set({ step }),
      setService: (s) => set({ service: s, step: 2 }),
      setBarber: (b) => set({ barber: b, step: 3 }),
      setNoBarber: () => set({ barber: null, step: 3 }),
      setDateTime: (date, time) => set({ date, time, step: 4 }),
      setContact: (c) => set({ contact: c, step: 5 }),
      setPaymentIntent: (pi) => set({ paymentIntent: pi }),
      setAppointmentId: (id) => set({ appointmentId: id, step: 6 }),

      reset: () => set({
        step: 1, service: null, barber: null, date: null,
        time: null, contact: null, paymentIntent: null, appointmentId: null,
      }),
    }),
    {
      name: 'mc-booking',
      partialize: (state) => ({
        step: state.step > 5 ? 1 : state.step, // don't persist confirmed state
        service: state.service,
        barber: state.barber,
        date: state.date,
        time: state.time,
        contact: state.contact,
      }),
    }
  )
)
