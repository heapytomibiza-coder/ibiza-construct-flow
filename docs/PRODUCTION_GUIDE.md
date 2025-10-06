# Production Deployment Guide - Phase 9

## Overview

Complete guide for deploying the application to production with monitoring, security, and optimization.

## Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] All environment variables configured
- [ ] Supabase project configured
- [ ] API keys securely stored
- [ ] Domain configured
- [ ] SSL certificate active

### 2. Security

- [ ] Content Security Policy configured
- [ ] Security headers enabled
- [ ] Rate limiting implemented
- [ ] Input validation active
- [ ] CORS properly configured

### 3. Performance

- [ ] Bundle size optimized (<500KB)
- [ ] Images optimized
- [ ] Caching strategy implemented
- [ ] Service worker registered
- [ ] Web Vitals tracking active

### 4. Monitoring

- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring setup

### 5. SEO

- [ ] Meta tags configured
- [ ] Robots.txt deployed
- [ ] Sitemap generated
- [ ] Structured data implemented
- [ ] Open Graph tags added

## Deployment Steps

### 1. Build for Production

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Build application
npm run build

# Preview production build
npm run preview
```

### 2. Environment Variables

Required environment variables:

```bash
# Supabase (auto-configured in Lovable Cloud)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# App Configuration
VITE_APP_URL=https://yourdomain.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
```

### 3. Deploy to Lovable

Lovable automatically deploys your application:
1. Click "Publish" in Lovable editor
2. Choose deployment settings
3. Deploy to production

### 4. Custom Domain Setup

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records
4. Wait for SSL certificate

## Post-Deployment

### 1. Verification

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Database operations work
- [ ] API endpoints respond
- [ ] Images load properly

### 2. Monitoring Setup

**Error Tracking:**
```typescript
// Errors automatically tracked via setupGlobalErrorHandling()
// View errors in console or integrate with service
```

**Analytics:**
```typescript
// Page views automatically tracked
// Custom events: analytics.track('event_name', { properties })
```

**Performance:**
```typescript
// Web Vitals automatically collected
// View in System Health dashboard
```

### 3. Performance Optimization

**CDN Configuration:**
- Static assets cached
- Images optimized
- Compression enabled

**Caching Strategy:**
- Service worker active
- API responses cached
- Static resources cached

### 4. Security Configuration

**Security Headers:**

Add to your hosting platform (Netlify, Vercel, etc.):

```
# _headers file
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Rate Limiting:**
```typescript
// Client-side rate limiting active
// Backend rate limiting via Edge Functions
```

## Monitoring & Maintenance

### 1. Health Checks

Access System Health dashboard at `/admin/health`:
- System status
- API availability
- Database connection
- Performance metrics

### 2. Error Monitoring

Monitor errors in production:
```typescript
// Errors logged automatically
// Check console in development
// Integrate error tracking service for production
```

### 3. Performance Monitoring

Track Core Web Vitals:
- LCP (Largest Contentful Paint) < 2.5s
- FCP (First Contentful Paint) < 1.8s
- CLS (Cumulative Layout Shift) < 0.1
- INP (Interaction to Next Paint) < 200ms

### 4. Analytics

Track user behavior:
```typescript
import { analytics } from '@/lib/analytics/tracking';

// Track custom events
analytics.track('button_clicked', { buttonName: 'signup' });

// Track conversions
analytics.conversion('user_signup', 1);
```

## Rollback Procedures

### 1. Via Lovable

1. Go to Version History
2. Select previous working version
3. Click "Restore"
4. Redeploy

### 2. Via Git (if using GitHub integration)

```bash
# Revert to previous commit
git revert HEAD

# Push changes
git push origin main
```

## Troubleshooting

### Common Issues

**1. Application not loading**
- Check environment variables
- Verify Supabase connection
- Check console for errors

**2. Authentication errors**
- Verify redirect URLs
- Check Supabase auth settings
- Confirm JWT configuration

**3. Performance issues**
- Check bundle size
- Verify caching
- Review Web Vitals

**4. Database errors**
- Check RLS policies
- Verify migrations
- Review query performance

## SEO Configuration

### 1. Meta Tags

Automatically configured via `usePageMetadata` hook:

```typescript
import { usePageMetadata } from '@/hooks/usePageMetadata';

function MyPage() {
  usePageMetadata({
    title: 'Page Title',
    description: 'Page description',
    keywords: ['keyword1', 'keyword2'],
  });
}
```

### 2. Structured Data

Add structured data for better SEO:

```typescript
import { generateStructuredData } from '@/lib/seo/metadata';

generateStructuredData({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ibiza Build Flow',
  url: 'https://yourdomain.com',
});
```

### 3. Sitemap

Generate sitemap for search engines:
- Automatically includes all public routes
- Updates on deployment
- Accessible at `/sitemap.xml`

## Performance Budget

### Bundle Size Targets

- Main bundle: < 500KB gzipped
- Route chunks: < 150KB each
- Total JS: < 1.2MB gzipped

### Web Vitals Targets

- LCP: < 2.5s (Good)
- FCP: < 1.8s (Good)
- CLS: < 0.1 (Good)
- INP: < 200ms (Good)
- TTFB: < 800ms (Good)

## Security Best Practices

### 1. Authentication

- Use Supabase Auth
- Enable RLS on all tables
- Implement proper session management

### 2. Input Validation

- Validate all user inputs
- Sanitize data before storage
- Use Zod for schema validation

### 3. API Security

- Rate limit API calls
- Validate request origins
- Use HTTPS only

### 4. Data Protection

- Encrypt sensitive data
- Implement proper access control
- Regular security audits

## Scaling Considerations

### Database

- Monitor query performance
- Optimize indexes
- Consider read replicas

### Edge Functions

- Monitor cold starts
- Optimize function size
- Consider connection pooling

### Frontend

- Monitor bundle size
- Optimize asset loading
- Implement progressive loading

## Support & Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Web Vitals](https://web.dev/vitals/)
- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security)

## Conclusion

Phase 9 production hardening ensures your application is:
- Secure and monitored
- Optimized for performance
- SEO-friendly
- Ready to scale
- Easy to maintain

Follow this guide for successful production deployment and ongoing maintenance.
