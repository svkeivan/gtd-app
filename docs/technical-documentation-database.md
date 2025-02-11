## Database Schema

### Core Models

```prisma
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