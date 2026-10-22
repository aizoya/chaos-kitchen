# Vercel Web Analytics Integration

This project has been configured with Vercel Web Analytics to track page views and performance metrics.

## What's Installed

- **Package**: `@vercel/analytics` (version 2.x)
- **Integration Type**: Vanilla JavaScript using the `inject()` function

## Files Modified/Created

1. **package.json** - Added `@vercel/analytics` dependency
2. **src/analytics.mjs** - Analytics initialization module
3. **src/app.mjs** - Main entry point that calls `initAnalytics()`
4. **index.html** - Includes the Vercel Analytics script tag

## How It Works

### Initialization

The analytics are initialized in `src/analytics.mjs`:

```javascript
import { inject } from '@vercel/analytics';

export function initAnalytics() {
  inject();
}
```

This function is called early in the application lifecycle from `src/app.mjs`:

```javascript
import { initAnalytics } from './analytics.mjs';

// Initialize Vercel Analytics for tracking
initAnalytics();
```

### HTML Integration

The `index.html` file includes a script tag that provides fallback browser support:

```html
<script>
  window.va = window.va || function () { 
    (window.vaq = window.vaq || []).push(arguments); 
  };
</script>
```

## Deployment & Verification

### Enable Analytics in Vercel Dashboard

1. Navigate to your project in the Vercel Dashboard
2. Go to the "Analytics" tab
3. Click "Enable Web Analytics"
4. Deploy your project with `vercel deploy`

### Verify Installation

After deployment, you can verify the analytics are working by:

1. Opening your deployed site in a browser
2. Opening the browser's Developer Tools (Network tab)
3. Looking for a Fetch/XHR request to a path matching `/_vercel/insights/*`

## Data Collection

- **Page Views**: Automatically tracked on each page load
- **Performance Metrics**: Web Vitals (LCP, FID, CLS, etc.)
- **User Sessions**: Anonymous visitor data

Analytics data typically appears in the Vercel dashboard after a few days of visitor traffic.

## Privacy & Compliance

Vercel Analytics is privacy-friendly and GDPR-compliant:
- No cookies are used
- No personal information is collected
- Visitors are anonymized
- Data is aggregated for insights

## Further Resources

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Web Vitals Explained](https://web.dev/vitals/)
- [Privacy Policy](https://vercel.com/legal/privacy-policy)

## Notes

This integration follows the official Vercel Analytics quickstart guide (fetched October 2026) and uses the recommended approach for vanilla JavaScript projects.
