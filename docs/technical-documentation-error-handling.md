## Error Handling and Logging

**Error Handling:**

The application uses `try...catch` blocks to handle errors. Error messages are typically thrown as exceptions and caught by the calling function.

**Logging:**

The application uses audit logs to track user activity. Audit logs are stored in the `AuditLog` model in the database.

**Key Files:**

-   `src/actions/profile.ts`: Contains the `updateProfile`, `cancelSubscription`, and `reactivateSubscription` functions, which create audit logs.
-   `prisma/schema.prisma`: Defines the `AuditLog` model.

**Audit Log Information:**

Audit logs contain the following information:

-   `userId`: The ID of the user who performed the action.
-   `action`: The action that was performed (e.g., "PROFILE_UPDATE", "SUBSCRIPTION_CANCELED").
-   `details`: A JSON string containing details about the action (e.g., the previous and new data for a profile update).
-   `createdAt`: The date and time the action was performed.