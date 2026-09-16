import React, { createContext, useContext, useState } from 'react';

const SafetyStateContext = createContext();

export const INITIAL_TIMELINE = [
  { id: 1, title: 'Journey started', time: '3:42 PM', detail: 'Departed College Campus', type: 'info' },
  { id: 2, title: 'Route confirmed', time: '3:43 PM', detail: 'Standard route to Home selected', type: 'info' },
  { id: 3, title: 'Check-in completed', time: '4:02 PM', detail: 'Automated 20-min checkpoint verified', type: 'success' }
];

export const MOCK_JOURNEY = {
  id: 'active-demo',
  startLocation: 'College Campus',
  destination: 'Home',
  routeDisplay: 'College → Home',
  expectedArrival: '8:45 PM',
  status: 'On track',
  progress: 65,
  batteryLevel: '84%',
  startedAt: '3:42 PM'
};

export const SafetyStateProvider = ({ children }) => {
  const [safetyState, setSafetyState] = useState('NORMAL');
  const [activeJourney, setActiveJourney] = useState(MOCK_JOURNEY);
  const [timelineEvents, setTimelineEvents] = useState(INITIAL_TIMELINE);
  const [isDiscreetMode, setIsDiscreetMode] = useState(false);

  const toggleDiscreetMode = () => {
    setIsDiscreetMode(prev => !prev);
  };

  const triggerStateChange = (newState, reason = '') => {
    setSafetyState(newState);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEvent = {
      id: Date.now(),
      title: `State transitioned to ${newState}`,
      time: now,
      detail: reason || `Safety state adjusted to ${newState} via Safety Engine simulation`,
      type: newState === 'NORMAL' ? 'success' : newState === 'CAUTION' ? 'warning' : 'crisis'
    };
    setTimelineEvents(prev => [newEvent, ...prev]);
  };

  return (
    <SafetyStateContext.Provider value={{
      safetyState,
      setSafetyState: triggerStateChange,
      activeJourney,
      setActiveJourney,
      timelineEvents,
      setTimelineEvents,
      isDiscreetMode,
      setIsDiscreetMode,
      toggleDiscreetMode
    }}>
      {children}
    </SafetyStateContext.Provider>
  );
};

export const useSafetyState = () => {
  const context = useContext(SafetyStateContext);
  if (!context) {
    throw new Error('useSafetyState must be used within a SafetyStateProvider');
  }
  return context;
};
