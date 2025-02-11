# GTD App Technical Documentation

## Overview and Purpose

GTD App is a modern task management application built on David Allen's Getting Things Done® methodology. It helps users capture, organize, and track tasks, projects, and commitments effectively through a structured digital system.

### Core Features
- Task inbox for quick capture
- Project management with detailed tracking
- Context-based organization
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
```bash
git clone [repository-url]
cd gtd-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
pnpx prisma generate
pnpx prisma db push
```

5. Start the development server:
```bash
pnpm dev