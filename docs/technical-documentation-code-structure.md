## Code Structure and Organization

The application follows a modular structure, with code organized into the following directories:

-   `src/`: Contains the main source code for the application.
-   `src/actions/`: Contains server actions for handling data mutations.
-   `src/app/`: Contains the Next.js application routes and pages.
-   `src/components/`: Contains reusable UI components.
-   `src/lib/`: Contains utility functions and shared logic.
-   `src/types/`: Contains TypeScript type definitions.

**Key Modules:**

-   `src/middleware.ts`: Defines the middleware function for handling requests.
-   `src/actions/auth.ts`: Contains authentication-related actions (e.g., `login`, `register`, `logout`).
-   `src/actions/profile.ts`: Contains actions related to user profiles (e.g., `getProfile`, `updateProfile`).
-   `src/lib/auth.ts`: Contains the `auth` function for retrieving user session data.
-   `src/lib/subscription.ts`: Contains the `SubscriptionService` class for managing subscriptions.