/**
 * Main application entry point
 * 
 * This file connects input to state and rendering for Chaos Kitchen.
 * It initializes the game and Vercel Analytics.
 */

import { initAnalytics } from './analytics.mjs';

// Initialize Vercel Analytics for tracking
initAnalytics();

// Your game initialization code would go here
// Example: connectInputToState(), renderGame(), etc.

export function initApp() {
  console.log('Chaos Kitchen app initialized with Vercel Analytics');
  // Add your game initialization logic here
}

// Auto-initialize when the module loads
initApp();
