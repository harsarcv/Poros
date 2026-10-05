# Poros — Sistem Manajemen Proyek & Kolaborasi Tim

Poros is a mobile project management and team collaboration application designed to help teams organize projects, assign tasks, monitor progress, and manage task workflows in one application.

## Features

- User authentication with JWT
- Role-based access control
- Project management
- Project member management
- Task creation and assignment
- Task priority and deadline management
- Task progress dashboard
- Task workflow with review and revision
- Activity history
- My Tasks for members
- User profile management
- Profile photo support
- Task revision notes
- REST API integration
- PostgreSQL database

## Roles & Access

### Admin / Manager

- Create, edit, and delete projects
- Manage project members
- Create and assign tasks
- Set task priority and deadline
- Review submitted tasks
- Approve tasks
- Request task revisions
- Monitor project and task progress
- View activity history

### Member

- View assigned projects
- View My Tasks
- View task details
- Start assigned tasks
- Submit tasks for review
- Accept task revisions
- View priority and deadline
- View activity history

## Task Workflow

Poros uses a structured task workflow:

```text
TODO
  ↓
IN PROGRESS
  ↓
REVIEW
  ↓
 ┌──────────────┐
 ↓              ↓
DONE           REVISI
                 ↓
            IN PROGRESS
                 ↓
               REVIEW
                 ↓
               DONE
```

Members manage the execution of tasks, while Admin / Manager handles the review process.

## Tech Stack

- **React Native** — Mobile application
- **Expo** — React Native development and Android build
- **TypeScript** — Main programming language
- **Node.js & Express.js** — Backend and REST API
- **PostgreSQL** — Relational database
- **JWT** — User authentication
- **AsyncStorage** — Local session storage
- **Multer** — Profile image upload
- **Git & GitHub** — Version control

## Database

Poros uses PostgreSQL with the following main tables:

- Users
- Projects
- Project Members
- Tasks
- Activity Logs

The `Tasks` table also stores task priority, status, deadline, and revision notes.

## Project Structure

```text
Poros/
├── assets/
│   ├── poros-icon.png
│   └── poros-logo.png
├── server/
│   ├── middleware/
│   ├── routes/
│   │   ├── activity.js
│   │   ├── auth.js
│   │   ├── members.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── db.js
│   ├── package.json
│   └── server.js
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── utils/
│   └── global.css
├── .gitignore
├── app.json
├── eas.json
├── package.json
├── README.md
├── structure.txt
└── tsconfig.json
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/harsarcv/Poros.git
cd Poros
```

### 2. Install mobile application dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure PostgreSQL

Create a PostgreSQL database named:

```text
poros
```

Then configure the database connection in:

```text
server/.env
```

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=poros
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_jwt_secret
```

Do not commit the `.env` file to GitHub.

### 5. Run the backend

From the `server/` directory:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 6. Run the mobile application

Open another terminal in the project root:

```bash
npm start
```

Then run the application using Expo Go or an Android emulator.

## API

Poros uses a REST API built with Node.js and Express.js.

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/register`

### Users

- `GET /api/users`
- `GET /api/users/me`

### Projects

- `GET /api/projects`
- Project creation, update, and deletion
- Project member management

### Tasks

- `GET /api/projects/:projectId/tasks`
- `POST /api/projects/:projectId/tasks`
- Task update and deletion
- Task status workflow
- Task revision management

### Activity

- Activity history endpoints are available through `/api/activity`

### Database Test

- `GET /api/test-db`

## Android Build

Preview APK build using Expo Application Services:

```bash
eas build --platform android --profile preview
```

## Security

- JWT authentication
- Role-based authorization
- Password hashing on the backend
- Protected API routes
- Local environment variables excluded from Git

## License

This project is licensed under the MIT License.

## Author

**Harsa Archive**

Full-Stack Developer | PostgreSQL & Database | Web, Mobile & 3D

GitHub: https://github.com/harsarcv