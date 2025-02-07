## Data Flow Diagrams

### User Authentication

1.  **User Input:** The user enters their email and password on the login page.
2.  **API Request:** The frontend sends a POST request to the `/api/auth/login` endpoint with the user's credentials.
3.  **Server Action:** The `login` function in `src/actions/auth.ts` is executed.
4.  **Data Validation:** The `login` function validates the email and password.
5.  **Database Query:** The `login` function queries the database to retrieve the user with the provided email.
6.  **Password Verification:** The `login` function verifies the password using bcrypt.
7.  **Session Creation:** If the credentials are valid, the `login` function creates an Iron Session and stores the user's ID and email in the session.
8.  **Session Storage:** The session data is stored in an encrypted cookie in the user's browser.
9.  **Response:** The `login` function returns a success response to the frontend.
10. **Frontend Redirect:** The frontend redirects the user to the dashboard.

### Task Management

1.  **User Input:** The user creates a new task in the inbox.
2.  **API Request:** The frontend sends a POST request to the `/api/items` endpoint with the task data.
3.  **Server Action:** The `createItem` function in `src/actions/items.ts` is executed.
4.  **Data Validation:** The `createItem` function validates the task data.
5.  **Database Update:** The `createItem` function creates a new task in the database using Prisma.
6.  **Response:** The `createItem` function returns a success response to the frontend.
7.  **Frontend Update:** The frontend updates the task list with the new task.

### Project Management

1.  **User Input:** The user creates a new project.
2.  **API Request:** The frontend sends a POST request to the `/api/projects` endpoint with the project data.
3.  **Server Action:** The `createProject` function in `src/actions/projects.ts` is executed.
4.  **Data Validation:** The `createProject` function validates the project data.
5.  **Database Update:** The `createProject` function creates a new project in the database using Prisma.
6.  **Response:** The `createProject` function returns a success response to the frontend.
7.  **Frontend Update:** The frontend updates the project list with the new project.