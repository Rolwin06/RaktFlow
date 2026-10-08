import { create } from 'zustand';

export interface SimulationEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

interface SimulationState {
  simulationTime: Date;
  isRunning: boolean;
  unitsSaved: number;
  shortagesPrevented: number;
  wastagePrevented: number;
  events: SimulationEvent[];

  // Actions
  toggleRunning: () => void;
  fastForwardHours: (hours: number) => void;
  addEvent: (event: Omit<SimulationEvent, 'id'>) => void;
  incrementUnitsSaved: (units: number) => void;
  incrementShortagesPrevented: () => void;
  incrementWastagePrevented: (units: number) => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  simulationTime: new Date(),
  isRunning: true,
  unitsSaved: 23,
  shortagesPrevented: 3,
  wastagePrevented: 17,
  events: [
    {
      id: 'evt-1',
      type: 'system',
      message: 'RaktFlow Network Control Center operational. 8 Blood Banks connected.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-2',
      type: 'algorithm',
      message: 'LifeLine Blood Bank inventory unconfirmed for 14h — penalized in ranking.',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-3',
      type: 'redistribution',
      message: 'Surplus detected at City Blood Bank (B+ Platelets, 18h expiry). Target: District BC.',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
  ],

  toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),

  fastForwardHours: (hours: number) => {
    set((state) => {
      const newTime = new Date(state.simulationTime.getTime() + hours * 60 * 60 * 1000);
      return {
        simulationTime: newTime,
        events: [
          {
            id: `evt-${Date.now()}`,
            type: 'clock',
            message: `Fast-forwarded clock by ${hours} hour(s) to ${newTime.toLocaleTimeString()}`,
            timestamp: newTime.toISOString(),
          },
          ...state.events,
        ],
      };
    });
  },

  addEvent: (evt) => {
    set((state) => ({
      events: [
        {
          ...evt,
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        },
        ...state.events.slice(0, 49), // retain last 50
      ],
    }));
  },

  incrementUnitsSaved: (units) =>
    set((state) => ({ unitsSaved: state.unitsSaved + units })),

  incrementShortagesPrevented: () =>
    set((state) => ({ shortagesPrevented: state.shortagesPrevented + 1 })),

  incrementWastagePrevented: (units) =>
    set((state) => ({ wastagePrevented: state.wastagePrevented + units })),

  resetSimulation: () =>
    set({
      simulationTime: new Date(),
      isRunning: true,
      unitsSaved: 23,
      shortagesPrevented: 3,
      wastagePrevented: 17,
      events: [
        {
          id: `evt-${Date.now()}`,
          type: 'system',
          message: 'Simulation reset to baseline state.',
          timestamp: new Date().toISOString(),
        },
      ],
    }),
}));
