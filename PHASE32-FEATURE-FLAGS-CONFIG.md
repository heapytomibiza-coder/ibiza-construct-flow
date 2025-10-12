# Phase 32: Advanced Feature Flags & Configuration System

Complete feature flag and dynamic configuration system with A/B testing, gradual rollouts, and user segmentation.

## Features

### 1. Feature Flag Management (`FeatureFlagManager`)
- **Flag States**: Enabled, Disabled, Conditional
- **Rollout Strategies**: Immediate, Percentage, Gradual, Targeted
- **Conditions**: User-based, Segment-based, Date-based, Custom
- **Evaluation Caching**: Performance optimization
- **Consistent Hashing**: Stable user bucketing

### 2. A/B Testing (`ABTestManager`)
- **Variant Management**: Multiple variants with weights
- **User Assignment**: Consistent variant assignment
- **Conversion Tracking**: Track goals and metrics
- **Statistical Analysis**: Winner determination with confidence
- **Test Lifecycle**: Draft, Running, Paused, Completed

### 3. Dynamic Configuration (`ConfigurationManager`)
- **Type Safety**: String, Number, Boolean, JSON, Array
- **Scopes**: Global, User, Tenant, Session
- **Validation**: Built-in and custom validators
- **Caching**: Performance optimization
- **Search & Tags**: Easy discovery

## Usage Examples

### Feature Flags

```typescript
import { useFeatureFlag, useFeatureFlags } from '@/hooks';

// Check single feature flag
function MyComponent() {
  const { enabled } = useFeatureFlag('new_checkout', {
    userId: user.id,
    segments: user.segments,
  });

  return enabled ? <NewCheckout /> : <OldCheckout />;
}

// Manage feature flags
function FlagManagement() {
  const { flags, setFlag, isEnabled } = useFeatureFlags();

  const createFlag = () => {
    setFlag({
      id: 'flag-1',
      key: 'dark_mode',
      name: 'Dark Mode',
      description: 'Enable dark mode UI',
      status: 'enabled',
      enabled: true,
      rollout: {
        strategy: 'percentage',
        percentage: 50, // 50% rollout
      },
      createdAt: new Date(),
    });
  };

  return <div>{/* UI */}</div>;
}
```

### Gradual Rollout

```typescript
import { featureFlagManager } from '@/lib/features';

// Create feature with gradual rollout
featureFlagManager.setFlag({
  id: 'new-feature',
  key: 'new_editor',
  name: 'New Editor',
  status: 'enabled',
  enabled: true,
  rollout: {
    strategy: 'gradual',
    gradualSteps: [
      { percentage: 10, date: new Date('2025-01-01') }, // 10% on Jan 1
      { percentage: 25, date: new Date('2025-01-07') }, // 25% on Jan 7
      { percentage: 50, date: new Date('2025-01-14') }, // 50% on Jan 14
      { percentage: 100, date: new Date('2025-01-21') }, // 100% on Jan 21
    ],
  },
  createdAt: new Date(),
});
```

### Conditional Flags

```typescript
// Feature enabled only for premium users
featureFlagManager.setFlag({
  id: 'premium-feature',
  key: 'advanced_analytics',
  name: 'Advanced Analytics',
  status: 'conditional',
  enabled: true,
  conditions: [
    {
      id: 'condition-1',
      type: 'segment',
      operator: 'in',
      field: 'subscription',
      value: ['premium', 'enterprise'],
    },
  ],
  createdAt: new Date(),
});
```

### A/B Testing

```typescript
import { useABTest } from '@/hooks';

function CheckoutPage() {
  const { variant, trackConversion } = useABTest('checkout-redesign', {
    userId: user.id,
  });

  const handlePurchase = async () => {
    await processPurchase();
    
    // Track conversion
    trackConversion('checkout-redesign', user.id, 'purchase', orderTotal);
  };

  return variant?.id === 'new-design' ? (
    <NewCheckout onPurchase={handlePurchase} />
  ) : (
    <OldCheckout onPurchase={handlePurchase} />
  );
}

// Create A/B test
function TestManagement() {
  const { createTest, getAllTests, completeTest } = useABTest();

  const setupTest = () => {
    createTest({
      id: 'checkout-test',
      name: 'Checkout Redesign Test',
      featureKey: 'checkout_design',
      status: 'draft',
      targetPercentage: 20, // 20% of users in test
      variants: [
        {
          id: 'control',
          name: 'Current Design',
          weight: 50,
          enabled: true,
        },
        {
          id: 'new-design',
          name: 'New Design',
          weight: 50,
          enabled: true,
        },
      ],
      metrics: [
        {
          id: 'conversion',
          name: 'Purchase Conversion',
          type: 'conversion',
          goal: 'maximize',
        },
        {
          id: 'revenue',
          name: 'Revenue per User',
          type: 'revenue',
          goal: 'maximize',
        },
      ],
      createdAt: new Date(),
    });
  };

  return <div>{/* UI */}</div>;
}
```

### Dynamic Configuration

```typescript
import { useConfig } from '@/hooks';

function MyComponent() {
  const { value: apiTimeout } = useConfig<number>('api_timeout', 5000);
  const { value: features } = useConfig<string[]>('enabled_features', []);
  const { update } = useConfig();

  const changeTimeout = () => {
    update('api_timeout', 10000);
  };

  return <div>API Timeout: {apiTimeout}ms</div>;
}

// Create configuration
function ConfigManagement() {
  const { setConfig, get } = useConfig();

  const createConfig = () => {
    setConfig({
      id: 'config-1',
      key: 'max_upload_size',
      value: 10485760, // 10MB
      type: 'number',
      scope: 'global',
      description: 'Maximum file upload size in bytes',
      validation: {
        required: true,
        min: 1048576, // 1MB min
        max: 104857600, // 100MB max
      },
      createdAt: new Date(),
    });
  };

  return <div>{/* UI */}</div>;
}
```

### User Segmentation

```typescript
// Check feature for specific segment
const context = {
  userId: user.id,
  segments: ['premium', 'early-adopter'],
  userAttributes: {
    country: 'US',
    signupDate: user.createdAt,
  },
};

const enabled = featureFlagManager.isEnabled('new_feature', context);
```

## Direct Library Usage

```typescript
import {
  featureFlagManager,
  abTestManager,
  configManager,
} from '@/lib/features';

// Feature flags
featureFlagManager.setFlag(flag);
const enabled = featureFlagManager.isEnabled('feature_key', context);
const evaluation = featureFlagManager.evaluate('feature_key', context);

// A/B testing
abTestManager.createTest(test);
const variant = abTestManager.getVariant('test-id', context);
abTestManager.trackConversion('test-id', userId, metricId, value);
const results = abTestManager.calculateResults('test-id');

// Configuration
configManager.set(config);
const value = configManager.get('config_key', defaultValue);
configManager.update('config_key', newValue);
```

## Architecture

### Feature Flag Flow
```
Component → useFeatureFlag → FeatureFlagManager → Evaluation
                                      ↓
                              Conditions & Rollout
                                      ↓
                                  Caching
```

### A/B Test Flow
```
Component → useABTest → ABTestManager → Variant Assignment
                              ↓
                        Conversion Tracking
                              ↓
                        Statistical Analysis
```

### Configuration Flow
```
Component → useConfig → ConfigurationManager → Value Retrieval
                              ↓
                         Validation & Caching
```

## Best Practices

### 1. Feature Flag Naming
```typescript
// Use descriptive, hierarchical names
'ui.dark_mode'
'checkout.new_flow'
'api.v2_endpoints'
```

### 2. Gradual Rollouts
```typescript
// Start small, increase gradually
rollout: {
  strategy: 'gradual',
  gradualSteps: [
    { percentage: 1, date: day1 },
    { percentage: 5, date: day2 },
    { percentage: 25, date: day5 },
    { percentage: 100, date: day10 },
  ],
}
```

### 3. A/B Test Sample Size
```typescript
// Ensure adequate sample size
targetPercentage: 50, // 50% of users in test
// Monitor until statistical significance
```

### 4. Configuration Validation
```typescript
// Always validate configuration
validation: {
  required: true,
  min: 1,
  max: 100,
  custom: (value) => {
    return value > 0 || 'Must be positive';
  },
}
```

## Integration Points

- **Monitoring**: Track flag evaluations and test metrics
- **Analytics**: Measure feature adoption and test results
- **User Profiles**: Context for targeting and segmentation
- **CI/CD**: Deploy flags before code
- **External Systems**: Sync with feature flag services

## Types

```typescript
type FeatureFlagStatus = 'enabled' | 'disabled' | 'conditional';
type RolloutStrategy = 'immediate' | 'percentage' | 'gradual' | 'targeted';
type ABTestStatus = 'draft' | 'running' | 'paused' | 'completed';
type ConfigScope = 'global' | 'user' | 'tenant' | 'session';
```

## Common Patterns

### Kill Switch
```typescript
// Instant disable for problematic features
featureFlagManager.setFlag({
  ...flag,
  enabled: false, // Instant disable
});
```

### Beta Features
```typescript
// Target specific user segments
conditions: [{
  type: 'segment',
  operator: 'in',
  field: 'role',
  value: ['beta-tester', 'admin'],
}]
```

### Temporary Features
```typescript
// Time-limited features
rollout: {
  strategy: 'immediate',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
}
```

## Files Created

### Library
- `src/lib/features/types.ts` - Type definitions
- `src/lib/features/FeatureFlagManager.ts` - Flag management
- `src/lib/features/ABTestManager.ts` - A/B testing
- `src/lib/features/ConfigurationManager.ts` - Configuration
- `src/lib/features/index.ts` - Module exports

### Hooks
- `src/hooks/features/useFeatureFlags.ts` - Flag management hook
- `src/hooks/features/useFeatureFlag.ts` - Single flag hook
- `src/hooks/features/useABTest.ts` - A/B testing hook
- `src/hooks/features/useConfig.ts` - Configuration hook
- `src/hooks/features/index.ts` - Module exports

## Next Steps

1. **Remote Configuration**: Sync with backend
2. **Admin Dashboard**: Build flag management UI
3. **Analytics Integration**: Track flag usage
4. **Experimentation Platform**: Advanced A/B testing
5. **Feature Lifecycle**: Manage flag deprecation
