# Contributing to GTD App

## Introduction

Thank you for considering contributing to GTD App! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

### Development Environment Setup

1. Fork and clone the repository:
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
# Edit .env with your local configuration
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

### Development Workflow

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "feat: add new feature"
```

3. Push to your fork:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request

## Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Enable strict mode
- Define interfaces for data structures
- Use proper type annotations

Example:
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: Priority;
  dueDate?: Date;
}

function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Implement proper prop types
- Follow component composition patterns
- Use proper naming conventions

Example:
```typescript
interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  // Implementation
}
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow BEM naming convention for custom CSS
- Maintain responsive design principles
- Ensure accessibility standards

Example:
```typescript
function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90",
        className
      )}
      {...props}
    />
  );
}
```

## Testing

### Writing Tests

- Write unit tests for utilities and hooks
- Write integration tests for components
- Write E2E tests for critical flows
- Maintain good test coverage

Example:
```typescript
describe('TaskCard', () => {
  it('renders task details correctly', () => {
    const task = {
      id: '1',
      title: 'Test Task',
      status: 'IN_PROGRESS'
    };
    
    render(<TaskCard task={task} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Documentation

### Code Documentation

- Use JSDoc comments for functions and components
- Document complex logic and algorithms
- Keep documentation up to date
- Include usage examples

Example:
```typescript
/**
 * Creates a new task in the system
 * @param {Omit<Task, 'id'>} task - The task data without ID
 * @returns {Promise<Task>} The created task with ID
 * @throws {ValidationError} If task data is invalid
 */
async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  // Implementation
}
```

### API Documentation

- Document all API endpoints
- Include request/response examples
- Document error responses
- Keep OpenAPI/Swagger specs updated

## Git Workflow

### Branch Naming

- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Performance improvements: `perf/description`

### Commit Messages

Follow conventional commits specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```bash
git commit -m "feat(tasks): add due date reminder functionality"
```

### Pull Requests

- Use the PR template
- Reference related issues
- Include clear descriptions
- Add screenshots for UI changes
- Ensure all checks pass

## Review Process

### Code Review Guidelines

1. Code Quality
   - Clean and readable code
   - Proper error handling
   - Performance considerations
   - Security best practices

2. Testing
   - Adequate test coverage
   - All tests passing
   - Edge cases covered

3. Documentation
   - Updated documentation
   - Clear comments
   - API documentation

### Review Checklist

- [ ] Code follows style guide
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Accessibility requirements met

## Release Process

### Version Control

Follow semantic versioning:
- MAJOR version for incompatible API changes
- MINOR version for new functionality
- PATCH version for bug fixes

### Release Checklist

1. Update version number
2. Update changelog
3. Run full test suite
4. Create release notes
5. Tag release
6. Deploy to staging
7. Verify deployment
8. Deploy to production

## Support

### Getting Help

- GitHub Issues for bug reports
- Discussions for questions
- Wiki for guides
- Stack Overflow for technical questions

### Contact

- Technical Lead: tech-lead@gtd-app.com
- Project Manager: pm@gtd-app.com
- Security Team: security@gtd-app.com

## License

By contributing to GTD App, you agree that your contributions will be licensed under the MIT License.