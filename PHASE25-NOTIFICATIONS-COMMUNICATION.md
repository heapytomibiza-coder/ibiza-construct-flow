# Phase 25: Advanced Notification & Communication System

## Overview
Comprehensive notification system with multi-channel delivery (in-app, email, push, SMS), preferences management, template engine, notification queue and batching, and real-time updates.

## Features Implemented

### 1. Notification Manager
- **Create Notifications**: Generate notifications with rich metadata
- **Multi-Channel Support**: In-app, email, push, SMS channels
- **Priority Levels**: Low, medium, high, urgent
- **Categories**: System, job, quote, payment, message, reminder, marketing
- **Status Tracking**: Pending, sent, delivered, read, failed
- **Filtering**: Advanced filtering by user, category, status, priority, date
- **Statistics**: Aggregate notification data and metrics
- **User Preferences**: Respect user notification preferences
- **Quiet Hours**: Pause notifications during specified hours
- **Expiration**: Auto-expire outdated notifications

### 2. Template Engine
- **Template System**: Reusable notification templates
- **Variable Substitution**: Dynamic content with {{variable}} syntax
- **Multi-Channel Templates**: Different content per channel
- **Default Templates**: Pre-configured templates for common scenarios
- **Template Validation**: Validate required variables
- **Category Organization**: Group templates by category
- **Enable/Disable**: Toggle templates on/off

### 3. Notification Queue
- **Queuing System**: Queue notifications for batch delivery
- **Batch Creation**: Group notifications for efficient sending
- **Scheduled Delivery**: Send notifications at specific times
- **Priority Processing**: Immediate delivery for high/urgent notifications
- **Auto-Processing**: Periodic batch processing
- **Queue Management**: Monitor and manage queue size

### 4. React Integration
- **Hooks**:
  - `useNotifications`: Main notification management hook
  - `useNotificationPreferences`: Preference management hook
- **Components**:
  - `NotificationCenter`: Dropdown notification center with badge
  - `NotificationItem`: Individual notification display
  - `NotificationPreferencesForm`: Preferences management UI

### 5. User Preferences
- **Channel Preferences**: Enable/disable per channel
- **Category Preferences**: Control notification types
- **Quiet Hours**: Set do-not-disturb periods
- **Batch vs Immediate**: Choose delivery timing
- **Per-User Settings**: Individual preference storage

## Architecture

### Notification Flow
```
Create → Check Preferences → Queue → Batch/Send → Deliver → Track Status
```

### Components
- **NotificationManager**: Central notification operations
- **TemplateEngine**: Template processing and rendering
- **NotificationQueue**: Queue and batch management
- **React Hooks**: React integration layer
- **UI Components**: User interface for notifications

## Usage Examples

### Create Notifications

```tsx
import { useNotifications } from '@/hooks/notifications';

function MyComponent() {
  const { createNotification } = useNotifications();

  const handleAction = async () => {
    await createNotification(
      'New Job Posted',
      'A new job matching your skills is available',
      {
        category: 'job',
        priority: 'high',
        channels: ['in_app', 'email', 'push'],
        actionUrl: '/jobs/123',
        actionLabel: 'View Job',
        metadata: { jobId: '123' },
      }
    );
  };

  return <button onClick={handleAction}>Post Job</button>;
}
```

### Display Notification Center

```tsx
import { NotificationCenter } from '@/components/notifications';

function Header() {
  return (
    <header>
      <nav>
        {/* Other navigation items */}
        <NotificationCenter />
      </nav>
    </header>
  );
}
```

### Manage Preferences

```tsx
import { NotificationPreferencesForm } from '@/components/notifications';

function SettingsPage() {
  return (
    <div>
      <h1>Notification Settings</h1>
      <NotificationPreferencesForm />
    </div>
  );
}
```

### Use Templates

```tsx
import { templateEngine } from '@/lib/notifications';
import { notificationManager } from '@/lib/notifications';

async function sendQuoteNotification(userId: string, quoteData: any) {
  // Render template
  const { title, body } = templateEngine.render('quote_received', {
    professionalName: quoteData.professionalName,
    jobTitle: quoteData.jobTitle,
    quoteAmount: quoteData.amount,
    quoteId: quoteData.id,
  });

  // Send notification
  await notificationManager.create(userId, title, body, {
    category: 'quote',
    priority: 'high',
    channels: ['in_app', 'email'],
    actionUrl: `/quotes/${quoteData.id}`,
    actionLabel: 'View Quote',
  });
}
```

### Custom Templates

```tsx
import { templateEngine } from '@/lib/notifications';

// Register custom template
templateEngine.register({
  id: 'custom_alert',
  name: 'Custom Alert',
  category: 'system',
  channels: ['in_app', 'push'],
  priority: 'urgent',
  title: '{{alertType}}: {{title}}',
  body: '{{message}}',
  variables: ['alertType', 'title', 'message'],
  enabled: true,
});

// Use template
const { title, body } = templateEngine.render('custom_alert', {
  alertType: 'URGENT',
  title: 'System Maintenance',
  message: 'The system will be down for maintenance in 10 minutes.',
});
```

### Filter Notifications

```tsx
import { useNotifications } from '@/hooks/notifications';

function NotificationsList() {
  const { notifications } = useNotifications({
    category: 'job',
    status: 'read',
    priority: 'high',
    limit: 10,
  });

  return (
    <div>
      {notifications.map(notification => (
        <div key={notification.id}>{notification.title}</div>
      ))
    </div>
  );
}
```

### Mark as Read

```tsx
import { useNotifications } from '@/hooks/notifications';

function NotificationItem({ notification }) {
  const { markAsRead } = useNotifications();

  const handleClick = async () => {
    await markAsRead(notification.id);
    // Navigate or perform action
  };

  return (
    <div onClick={handleClick}>
      {notification.title}
    </div>
  );
}
```

### Batch Notifications

```tsx
import { notificationQueue } from '@/lib/notifications';

// Add to queue for batching
notifications.forEach(notification => {
  notificationQueue.enqueue(notification);
});

// Create batch for user
const batch = notificationQueue.createBatch(
  userId,
  new Date(Date.now() + 5 * 60 * 1000) // Send in 5 minutes
);

// Process queue
await notificationQueue.process(async (notifications) => {
  // Send notifications through your delivery system
  await sendNotifications(notifications);
});
```

### Get Statistics

```tsx
import { useNotifications } from '@/hooks/notifications';

function NotificationStats() {
  const { getStatistics } = useNotifications();
  const stats = getStatistics();

  if (!stats) return null;

  return (
    <div>
      <p>Total: {stats.total}</p>
      <p>Unread: {stats.unread}</p>
      <p>By Category:</p>
      <ul>
        {Object.entries(stats.byCategory).map(([category, count]) => (
          <li key={category}>{category}: {count}</li>
        ))
      </ul>
    </div>
  );
}
```

### Quiet Hours

```tsx
import { useNotificationPreferences } from '@/hooks/notifications';

function QuietHoursSettings() {
  const { preferences, updateQuietHours } = useNotificationPreferences();

  const handleToggle = (enabled: boolean) => {
    updateQuietHours({
      enabled,
      start: '22:00',
      end: '08:00',
    });
  };

  return (
    <div>
      <Switch
        checked={preferences?.quietHours?.enabled || false}
        onCheckedChange={handleToggle}
      />
      <p>Quiet hours: {preferences?.quietHours?.start} - {preferences?.quietHours?.end}</p>
    </div>
  );
}
```

## Default Templates

### Welcome Message
- **ID**: `welcome`
- **Category**: system
- **Channels**: in_app, email
- **Variables**: userName, appName

### New Job
- **ID**: `new_job`
- **Category**: job
- **Channels**: in_app, email
- **Variables**: customerName, jobTitle, jobId

### Quote Received
- **ID**: `quote_received`
- **Category**: quote
- **Channels**: in_app, email, push
- **Variables**: professionalName, jobTitle, quoteAmount, quoteId

### Payment Success
- **ID**: `payment_success`
- **Category**: payment
- **Channels**: in_app, email
- **Variables**: amount, transactionId

### Reminder
- **ID**: `reminder`
- **Category**: reminder
- **Channels**: in_app, push
- **Variables**: title, message

## Notification Categories

- **system**: System-wide notifications
- **job**: Job-related notifications
- **quote**: Quote and proposal notifications
- **payment**: Payment and billing notifications
- **message**: Direct messages and chat
- **reminder**: Reminders and scheduled notifications
- **marketing**: Marketing and promotional content

## Priority Levels

- **low**: Non-urgent, can be batched
- **medium**: Standard notifications
- **high**: Important, send immediately
- **urgent**: Critical, highest priority

## Best Practices

1. **Use Templates**: Create templates for consistency
2. **Respect Preferences**: Always check user preferences
3. **Appropriate Priority**: Don't overuse high/urgent
4. **Clear Actions**: Include actionUrl when applicable
5. **Batch Low Priority**: Batch non-urgent notifications
6. **Test Channels**: Verify delivery on all channels
7. **Expiration**: Set expiration for time-sensitive notifications
8. **Clean Up**: Periodically clean expired notifications

## Integration with Other Systems

### WebSocket Integration (Phase 20)
```tsx
import { realtimeManager } from '@/lib/websocket';
import { notificationManager } from '@/lib/notifications';

// Subscribe to notification channel
const channel = realtimeManager.channel('notifications');

channel.on('new_notification', (data) => {
  notificationManager.create(
    data.userId,
    data.title,
    data.message,
    data.options
  );
});
```

### Analytics Integration (Phase 22)
```tsx
import { analyticsManager } from '@/lib/analytics';

// Track notification events
analyticsManager.track('notification_sent', {
  category: notification.category,
  priority: notification.priority,
  channels: notification.channels,
});
```

## Future Enhancements

- [ ] Rich media notifications (images, videos)
- [ ] Notification sounds
- [ ] Desktop notifications API
- [ ] Email template designer
- [ ] SMS delivery via Twilio
- [ ] Push notification service worker
- [ ] Notification groups and threading
- [ ] Notification actions (buttons)
- [ ] Read receipts
- [ ] Delivery reports

## Dependencies

- uuid: Notification ID generation
- date-fns: Date formatting
- React: UI components
- Existing auth system: User context

## Testing

```tsx
import { describe, it, expect } from 'vitest';
import { notificationManager } from '@/lib/notifications';

describe('Notifications', () => {
  it('creates notification', async () => {
    const notification = await notificationManager.create(
      'user123',
      'Test',
      'Test message'
    );
    
    expect(notification.id).toBeDefined();
    expect(notification.status).toBe('pending');
  });
  
  it('marks as read', async () => {
    const notification = await notificationManager.create(
      'user123',
      'Test',
      'Test'
    );
    
    await notificationManager.markAsRead(notification.id);
    
    const updated = notificationManager.getNotification(notification.id);
    expect(updated?.status).toBe('read');
  });
});
```

## Performance Considerations

- Batch low-priority notifications
- Limit notification history per user
- Auto-cleanup expired notifications
- Paginate notification lists
- Use virtual scrolling for long lists
- Debounce status updates

## Security

- Validate user owns notifications before operations
- Sanitize notification content
- Rate limit notification creation
- Verify channel permissions
- Secure delivery endpoints
