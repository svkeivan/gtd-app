# GTD App Technical Documentation

## Overview and Purpose

GTD App is a modern task management application built on David Allen's Getting Things Done® methodology. It helps users capture, organize, and track tasks, projects, and commitments effectively through a structured digital system.

### Core Features
- Task inbox for quick capture
- Project management with detailed tracking
- Context-based task organization
- Calendar integration
- Analytics and reporting
- Review system
- Team collaboration features
- Subscription-based access tiers

## System Requirements and Dependencies

### Frontend
- Node.js 18.x or higher
- React 19.x
- Next.js 15.x
- TypeScript 5.x

### Backend
- Prisma ORM 6.x
- PostgreSQL 14.x or higher
- Iron Session for authentication

### Key Dependencies
- UI Components: Radix UI (@radix-ui/*)
- Forms: react-hook-form, @hookform/resolvers
- Date Handling: date-fns, moment
- Calendar: react-big-calendar, react-day-picker
- Drag & Drop: @hello-pangea/dnd
- State Management: zustand
- Charts: recharts
- Styling: Tailwind CSS
- Validation: zod
- Markdown: react-markdown

## Installation Instructions

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd gtd-app
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Initialize the database:
\`\`\`bash
pnpx prisma generate
pnpx prisma db push
\`\`\`

5. Start the development server:
\`\`\`bash
pnpm dev
\`\`\`

## Configuration Steps

### Environment Variables
- \`DATABASE_URL\`: PostgreSQL connection string
- \`NEXTAUTH_SECRET\`: Session encryption key
- \`STRIPE_SECRET_KEY\`: Stripe API key for payments
- \`STRIPE_WEBHOOK_SECRET\`: Stripe webhook secret
- \`SMTP_*\`: Email service configuration

### Database Configuration
The application uses Prisma ORM with PostgreSQL. Database schema is defined in \`prisma/schema.prisma\`.

### Authentication Setup
Uses Iron Session for secure, encrypted session management:
\`\`\`typescript
// src/lib/session.ts configuration
export const sessionOptions = {
  cookieName: "gtd_session",
  password: process.env.SESSION_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
\`\`\`

## Core Features and Functionality

### 1. Task Management
- Quick capture inbox
- Task processing workflow
- Context-based organization
- Project association
- Due date tracking
- Priority levels
- Tags and labels

### 2. Project Management
- Project creation and tracking
- Milestone management
- Progress monitoring
- Team collaboration
- File attachments
- Project templates

### 3. Calendar Integration
- Task scheduling
- Deadline tracking
- Calendar view options
- External calendar sync
- Recurring tasks

### 4. Analytics
- Productivity metrics
- Project progress
- Time tracking
- Custom reports
- Data visualization

## API Reference and Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/session

### Tasks
- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

### Projects
- GET /api/projects
- POST /api/projects
- PUT /api/projects/:id
- DELETE /api/projects/:id

### Contexts
- GET /api/contexts
- POST /api/contexts
- PUT /api/contexts/:id
- DELETE /api/contexts/:id

## Database Schema

### Core Models

\`\`\`prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  hashedPassword  String
  subscription    Subscription?
  maxProjects     Int      @default(3)
  projects        Project[]
  tasks           Task[]
  contexts        Context[]
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      TaskStatus
  priority    Priority?
  dueDate     DateTime?
  userId      String
  projectId   String?
  contextId   String?
  user        User     @relation(fields: [userId], references: [id])
  project     Project? @relation(fields: [projectId], references: [id])
  context     Context? @relation(fields: [contextId], references: [id])
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      ProjectStatus
  dueDate     DateTime?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  tasks       Task[]
}

model Context {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  tasks       Task[]
}
\`\`\`

## Architecture Diagrams

### System Architecture
\`\`\`
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
\`\`\`

## Security Considerations

### Authentication & Authorization
- Secure session management with Iron Session
- Password hashing with bcrypt
- CSRF protection
- Rate limiting on sensitive endpoints

### Data Protection
- Input validation with Zod
- SQL injection prevention with Prisma
- XSS protection
- HTTPS enforcement

### API Security
- Request validation
- Error handling
- Audit logging
- Rate limiting

## Performance Optimization

### Frontend
- Code splitting
- Image optimization
- Lazy loading
- Client-side caching
- Bundle size optimization

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Response caching
- Rate limiting

## Deployment Guidelines

### Production Deployment
1. Build the application:
\`\`\`bash
pnpm build
\`\`\`

2. Run database migrations:
\`\`\`bash
pnpx prisma migrate deploy
\`\`\`

3. Start the production server:
\`\`\`bash
pnpm start
\`\`\`

### Environment Setup
- Configure environment variables
- Set up SSL certificates
- Configure database backups
- Set up monitoring

## Contributing Guidelines

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests
5. Submit pull request

### Code Style
- Follow TypeScript best practices
- Use Prettier for formatting
- Follow ESLint rules
- Write meaningful commit messages

## Changelog and Version History

### v0.1.0 (Current)
- Initial release
- Core task management features
- Project management
- Basic analytics
- User authentication
- Subscription system

## License Information

Copyright © 2025 GTD App

Licensed under the MIT License. See LICENSE file for details.