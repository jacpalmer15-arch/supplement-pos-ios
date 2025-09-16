import React, { useState, useEffect, useRef } from 'react';
import { KIOSK_SETTINGS } from '../constants/config';

export const useIdleTimer = (onTimeout: () => void, enabled: boolean = true) => {
  const [isActive, setIsActive] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(KIOSK_SETTINGS.IDLE_TIMEOUT_MS);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const reset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (!enabled) return;

    setTimeRemaining(KIOSK_SETTINGS.IDLE_TIMEOUT_MS);
    setIsActive(true);

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
      onTimeout();
    }, KIOSK_SETTINGS.IDLE_TIMEOUT_MS);
  };

  useEffect(() => {
    if (enabled) {
      reset();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (timeRemaining <= 0 && enabled) {
      setIsActive(false);
      onTimeout();
    }
  }, [timeRemaining, enabled, onTimeout]);

  return {
    isActive,
    timeRemaining: Math.max(0, Math.ceil(timeRemaining / 1000)),
    reset
  };
};