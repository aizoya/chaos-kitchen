/**
 * Vercel Web Analytics integration
 * 
 * This module initializes Vercel Analytics for tracking page views and performance.
 * The inject() function should be called once when the application loads.
 */

import { inject } from '@vercel/analytics';

/**
 * Initialize Vercel Analytics
 * Call this function early in your application lifecycle
 */
export function initAnalytics() {
  inject();
}
