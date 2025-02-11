# Subscription Model Architecture

## Overview
This document outlines the architectural decisions for implementing a subscription model with a 15-day trial period in the GTD application.

## Database Schema Changes

### New Subscription Model
We will add a new `Subscription` model with the following fields:
```prisma
model Subscription {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  plan            SubscriptionPlan
  status          SubscriptionStatus
  trialEndsAt     DateTime?
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum SubscriptionPlan {
  FREE
  PERSONAL
  PROFESSIONAL
  ENTERPRISE
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  CANCELED
  PAST_DUE
  UNPAID
}
```

### User Model Updates
The User model will be updated to include:
```prisma
model User {
  // ... existing fields ...
  subscription    Subscription?
  maxProjects    Int @default(3) // Limit based on subscription plan
}
```

## Pricing Structure
The pricing tiers will be updated to reflect:
- 15-day trial period (changed from 14 days)
- Clear feature limitations per tier
- Monthly pricing structure

### Pricing Tiers
1. Free Trial
   - 15 days access to Professional features
   - Converts to Free plan after trial

2. Personal ($9/month)
   - 10 projects
   - Full analytics
   - Priority support

3. Professional ($19/month)
   - Unlimited projects
   - Advanced analytics
   - Priority support
   - Team collaboration features

4. Enterprise (Custom pricing)
   - Custom project limits
   - Dedicated support
   - Custom integrations
   - SLA guarantees

## Implementation Steps
1. Create database migration for subscription model
2. Update user registration flow to create trial subscription
3. Implement subscription status checks
4. Add subscription management UI
5. Integrate payment processing
6. Update pricing section UI
7. Implement feature gates based on subscription status

## Technical Considerations
- Use Stripe for payment processing
- Implement webhook handlers for subscription events
- Add background jobs for trial expiration notifications
- Implement graceful degradation for expired subscriptions
- Add subscription status caching for performance

## Security Considerations
- Encrypt sensitive payment information
- Implement role-based access control for subscription features
- Add audit logging for subscription changes
- Secure webhook endpoints

## Monitoring and Analytics
- Track trial conversion rates
- Monitor subscription status changes
- Alert on payment failures
- Track feature usage by subscription tier

## Future Considerations
- Annual billing options
- Team/Organization plans
- Custom enterprise features
- Volume-based pricing
- Referral program