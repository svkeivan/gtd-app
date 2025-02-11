# GTD App - Task Management System

A modern task management application built on GTD (Getting Things Done) principles, helping users organize tasks, projects, and commitments effectively.

## Overview

GTD App is a comprehensive task management system that implements David Allen's Getting Things Done methodology. It provides a structured approach to organizing tasks, projects, and commitments while offering modern features like analytics, calendar integration, and team collaboration.

## Key Features

- 📥 Inbox for quick task capture
- 📋 Project management with detailed tracking
- 🔍 Context-based task organization
- 📅 Calendar integration
- 📊 Analytics and reporting
- 🔄 Regular review system
- 👥 Team collaboration features
- 📱 Responsive design
- 🌙 Dark mode support
- ⌨️ Keyboard shortcuts
- 🔒 Secure authentication
- 💳 Subscription-based access

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Iron Session
- **Forms**: React Hook Form, Zod
- **Charts**: Recharts
- **Calendar**: React Big Calendar
- **Date Handling**: date-fns, moment
- **Drag & Drop**: @hello-pangea/dnd

## Documentation

### For Users
- [User Guide](docs/user-guide.md) - Complete guide to using the application
- [FAQ](docs/faq.md) - Frequently asked questions
- [Troubleshooting](docs/troubleshooting-guide.md) - Common issues and solutions

### For Developers
- [Technical Documentation](docs/technical-documentation.md) - System architecture and implementation details
- [API Documentation](docs/api-documentation.md) - Complete API reference
- [Contributing Guide](docs/contributing-guide.md) - How to contribute to the project
- [Security Guide](docs/security-guide.md) - Security features and considerations
- [Deployment Guide](docs/deployment-guide.md) - Deployment process and configuration

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/gtd-app.git
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

4. Set up the database:
```bash
pnpx prisma generate
pnpx prisma db push
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

```bash
# Required environment variables
DATABASE_URL=postgresql://user:password@localhost:5432/gtd_db
NEXTAUTH_SECRET=your-auth-secret
SESSION_SECRET=your-session-secret
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

## Project Structure

```
gtd-app/
├── docs/               # Documentation files
├── prisma/            # Database schema and migrations
├── public/            # Static assets
└── src/
    ├── actions/       # Server actions
    ├── app/          # Next.js app router pages
    ├── components/   # React components
    ├── lib/          # Utility functions
    └── types/        # TypeScript types
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing-guide.md) for details.

## Security

For security issues, please see our [Security Guide](docs/security-guide.md) and contact security@gtd-app.com.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Email: support@gtd-app.com
- Issues: [GitHub Issues](https://github.com/your-username/gtd-app/issues)
- Discord: [Join our community](https://discord.gg/gtd-app)

## Acknowledgments

- [Getting Things Done®](https://gettingthingsdone.com/) by David Allen
- [Next.js](https://nextjs.org/) team
- [Tailwind CSS](https://tailwindcss.com/) team
- [shadcn/ui](https://ui.shadcn.com/) components
- All our contributors

## Version History

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## Roadmap

- [ ] Mobile applications
- [ ] API integrations
- [ ] Advanced team features
- [ ] AI-powered suggestions
- [ ] Custom workflows
- [ ] Extended analytics

---
Built with ❤️ by the GTD App Team
