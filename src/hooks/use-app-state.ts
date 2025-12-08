"use client";

import { useContext } from 'react';
import { RestaurantContext } from '@/providers/restaurant-state-provider';

export const useAppState = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a RestaurantProvider');
  }
  return context;
};
