import { create } from "zustand";

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  locate: string;
};

type EventStore = {
  events: Event[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (eventId: string, updatedFields: Partial<Event>) => void;
};

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  removeEvent: (eventId) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId),
    })),

  updateEvent: (eventId, updatedFields) => {
    console.log("Atualizando evento com ID:", eventId);
    console.log("Campos atualizados:", updatedFields);
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, ...updatedFields } : event
      ),
    }));
  },
}));
