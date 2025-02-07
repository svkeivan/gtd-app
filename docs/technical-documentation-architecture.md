## Architecture Diagrams

### System Architecture
```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Next.js App   |     |   API Routes   |     |   Database    |
|                |     |                |     |                |
+----------------+     +----------------+     +----------------+
       |                      |                      |
       |                      |                      |
+----------------+     +----------------+     +----------------+
|   UI Layer     |     | Business Logic |     |   Data Layer  |
|  React/Radix   |     |    Services    |     |    Prisma     |
+----------------+     +----------------+     +----------------+