# ADR 0001: Fix Subscription Info Props Handling

## Context

We are experiencing a TypeError in the profile section where the code is attempting to read properties of undefined. Specifically, the error occurs when trying to access `window.__NEXT_DATA__.props.pageProps.userId` in the SubscriptionInfo component.

## Problem

The current implementation has several architectural issues:

1. Direct access to `window.__NEXT_DATA__` is an anti-pattern in Next.js as it makes assumptions about the internal structure of Next.js's runtime data.
2. The component is tightly coupled to Next.js's internal implementation details.
3. There's no proper prop drilling or state management for essential data like userId.
4. The component might render before the window object is available in the client-side hydration process.

## Decision

We will implement the following architectural changes:

1. Move the user ID fetching logic to the page level (server component)
2. Pass the user ID explicitly as a prop to the SubscriptionInfo component
3. Implement proper error boundaries and loading states
4. Use proper Next.js patterns for data fetching

### Implementation Details

1. Update the profile page component to fetch user data:
```typescript
// src/app/dashboard/profile/page.tsx
import { auth } from "@/lib/auth"

export default async function ProfilePage() {
  const { user } = await auth()
  
  return (
    // ...
    <SubscriptionInfo userId={user.id} />
    // ...
  )
}
```

2. Modify SubscriptionInfo to accept userId as a prop:
```typescript
// src/app/dashboard/profile/subscription-info.tsx
interface SubscriptionInfoProps {
  userId: string
}

export function SubscriptionInfo({ userId }: SubscriptionInfoProps) {
  // Use userId directly instead of accessing window.__NEXT_DATA__
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await SubscriptionService.getSubscription(userId)
        // ...
      } catch (err) {
        // ...
      }
    }
    
    fetchSubscription()
  }, [userId])
  
  // ...
}
```

## Consequences

### Positive

1. More reliable data fetching and prop handling
2. Better separation of concerns between server and client components
3. Improved type safety with explicit props
4. Easier testing as components have clear dependencies
5. Reduced coupling to Next.js internals
6. Better error handling and loading states

### Negative

1. Requires changes to multiple components
2. Slight increase in code complexity due to proper prop drilling
3. Need to ensure proper error boundaries are in place

## Implementation Notes

The implementation requires changes to both the page component and the SubscriptionInfo component. Since these changes involve modifying TypeScript/React components, they should be implemented by switching to Code mode.

## Action Items

1. Switch to Code mode to implement these changes
2. Update the profile page component to fetch and pass user ID
3. Modify SubscriptionInfo component to accept userId as a prop
4. Add proper error boundaries
5. Test the changes thoroughly, especially during the hydration process