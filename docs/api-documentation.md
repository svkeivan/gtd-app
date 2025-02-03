# GTD App API Documentation

## Overview

This document provides comprehensive documentation for the GTD App's REST API endpoints. All API routes are prefixed with `/api`.

## Authentication

### Authentication Headers
```http
Authorization: Bearer {session_token}
```

### Session Management
- Sessions are managed via HTTP-only cookies
- Session duration: 7 days
- Rate limiting: 100 requests per minute

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!",
  "name": "John Doe"
}

Response 201 Created
{
  "id": "cuid123",
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!"
}

Response 200 OK
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "expiresAt": "2025-02-10T08:45:20.000Z"
  }
}
```

#### Logout
```http
POST /api/auth/logout

Response 200 OK
{
  "message": "Logged out successfully"
}
```

### Tasks

#### List Tasks
```http
GET /api/tasks
Query Parameters:
- status: TaskStatus
- projectId: string
- contextId: string
- page: number
- limit: number

Response 200 OK
{
  "tasks": [
    {
      "id": "cuid123",
      "title": "Complete documentation",
      "description": "Write API documentation",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2025-02-10T00:00:00.000Z",
      "projectId": "project123",
      "contextId": "context123",
      "createdAt": "2025-02-03T08:45:20.000Z",
      "updatedAt": "2025-02-03T08:45:20.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete documentation",
  "description": "Write API documentation",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2025-02-10T00:00:00.000Z",
  "projectId": "project123",
  "contextId": "context123"
}

Response 201 Created
{
  "id": "cuid123",
  "title": "Complete documentation",
  "description": "Write API documentation",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2025-02-10T00:00:00.000Z",
  "projectId": "project123",
  "contextId": "context123",
  "createdAt": "2025-02-03T08:45:20.000Z",
  "updatedAt": "2025-02-03T08:45:20.000Z"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title",
  "status": "COMPLETED"
}

Response 200 OK
{
  "id": "cuid123",
  "title": "Updated title",
  "status": "COMPLETED",
  "updatedAt": "2025-02-03T08:45:20.000Z"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id

Response 200 OK
{
  "message": "Task deleted successfully"
}
```

### Projects

#### List Projects
```http
GET /api/projects
Query Parameters:
- status: ProjectStatus
- page: number
- limit: number

Response 200 OK
{
  "projects": [
    {
      "id": "project123",
      "name": "API Documentation",
      "description": "Create comprehensive API docs",
      "status": "IN_PROGRESS",
      "dueDate": "2025-02-10T00:00:00.000Z",
      "createdAt": "2025-02-03T08:45:20.000Z",
      "updatedAt": "2025-02-03T08:45:20.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "API Documentation",
  "description": "Create comprehensive API docs",
  "status": "IN_PROGRESS",
  "dueDate": "2025-02-10T00:00:00.000Z"
}

Response 201 Created
{
  "id": "project123",
  "name": "API Documentation",
  "description": "Create comprehensive API docs",
  "status": "IN_PROGRESS",
  "dueDate": "2025-02-10T00:00:00.000Z",
  "createdAt": "2025-02-03T08:45:20.000Z",
  "updatedAt": "2025-02-03T08:45:20.000Z"
}
```

#### Update Project
```http
PUT /api/projects/:id
Content-Type: application/json

{
  "name": "Updated Project Name",
  "status": "COMPLETED"
}

Response 200 OK
{
  "id": "project123",
  "name": "Updated Project Name",
  "status": "COMPLETED",
  "updatedAt": "2025-02-03T08:45:20.000Z"
}
```

#### Delete Project
```http
DELETE /api/projects/:id

Response 200 OK
{
  "message": "Project deleted successfully"
}
```

### Contexts

#### List Contexts
```http
GET /api/contexts

Response 200 OK
{
  "contexts": [
    {
      "id": "context123",
      "name": "Work",
      "description": "Work-related tasks",
      "createdAt": "2025-02-03T08:45:20.000Z",
      "updatedAt": "2025-02-03T08:45:20.000Z"
    }
  ]
}
```

#### Create Context
```http
POST /api/contexts
Content-Type: application/json

{
  "name": "Work",
  "description": "Work-related tasks"
}

Response 201 Created
{
  "id": "context123",
  "name": "Work",
  "description": "Work-related tasks",
  "createdAt": "2025-02-03T08:45:20.000Z",
  "updatedAt": "2025-02-03T08:45:20.000Z"
}
```

#### Update Context
```http
PUT /api/contexts/:id
Content-Type: application/json

{
  "name": "Updated Context",
  "description": "Updated description"
}

Response 200 OK
{
  "id": "context123",
  "name": "Updated Context",
  "description": "Updated description",
  "updatedAt": "2025-02-03T08:45:20.000Z"
}
```

#### Delete Context
```http
DELETE /api/contexts/:id

Response 200 OK
{
  "message": "Context deleted successfully"
}
```

### Analytics

#### Get User Analytics
```http
GET /api/analytics/user
Query Parameters:
- startDate: string (YYYY-MM-DD)
- endDate: string (YYYY-MM-DD)

Response 200 OK
{
  "taskCompletion": {
    "total": 100,
    "completed": 75,
    "rate": 0.75
  },
  "projectProgress": {
    "total": 10,
    "completed": 6,
    "inProgress": 3,
    "notStarted": 1
  },
  "timeDistribution": {
    "work": 40,
    "personal": 35,
    "errands": 25
  }
}
```

#### Get Project Analytics
```http
GET /api/analytics/project/:id

Response 200 OK
{
  "tasks": {
    "total": 20,
    "completed": 15,
    "inProgress": 3,
    "blocked": 2
  },
  "timeline": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-02-28T00:00:00.000Z",
    "progress": 0.75
  },
  "activity": [
    {
      "date": "2025-02-03",
      "tasksCompleted": 5,
      "tasksAdded": 2
    }
  ]
}
```

## Error Responses

### Common Error Formats
```http
Response 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": ["error message"]
    }
  }
}

Response 401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

Response 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}

Response 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}

Response 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}

Response 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error"
  }
}
```

## Data Types

### Task Status
```typescript
enum TaskStatus {
  INBOX = "INBOX",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  BLOCKED = "BLOCKED",
  ARCHIVED = "ARCHIVED"
}
```

### Project Status
```typescript
enum ProjectStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
  CANCELED = "CANCELED"
}
```

### Priority Levels
```typescript
enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}
```

## Rate Limiting

- Default rate limit: 100 requests per minute
- Authentication endpoints: 10 requests per minute
- Analytics endpoints: 30 requests per minute
- Headers included in response:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

## Versioning

- Current version: v1
- Version is specified in the URL: `/api/v1/`
- Older versions will be supported for 6 months after deprecation notice

## Changelog

### v1.0.0 (2025-02-03)
- Initial API release
- Basic CRUD operations for tasks, projects, and contexts
- User authentication
- Analytics endpoints