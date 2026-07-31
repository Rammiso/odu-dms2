# ODU Dormitory Management System - Comprehensive Architecture Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Authentication & Authorization Flow](#authentication--authorization-flow)
6. [Data Flow Between Frontend and Backend](#data-flow-between-frontend-and-backend)
7. [Database Schema](#database-schema)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Key Business Flows](#key-business-flows)
10. [Security Considerations](#security-considerations)

---

## System Overview

The ODU Dormitory Management System (ODU-DMS) is a full-stack web application for managing university dormitory operations. It provides centralized management for room assignments, maintenance requests, inventory tracking, and user administration.

**Core Actors**:
- **Students**: View room, submit maintenance requests, request room changes
- **Dorm Administrators**: Manage rooms, assign students, approve requests
- **Maintenance Staff**: View and update maintenance tasks
- **Management**: View reports, oversee operations
- **System Administrators**: Manage users, configure system

---

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs for password hashing
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Morgan HTTP logger

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: React Context API
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)
- **HTTP Client**: Native Fetch API with custom wrapper

---

## Backend Architecture

### Directory Structure
```
backend/
├── config/db.js              # Database connection
├── middleware/
│   ├── auth.js               # JWT authentication
│   ├── errorHandler.js       # Global error handling
│   └── rbac.js               # Role-based access control
├── models/                   # Mongoose schemas (User, Student, Room, etc.)
├── repositories/             # Database access layer
├── services/                 # Business logic layer
├── validators/               # Joi validation schemas
├── routes/                   # API route definitions
├── utils/                    # Utilities (ApiError, logger)
├── seed.js                   # Database seeding
└── server.js                 # Application entry point
```

### Architecture Pattern: Layered Architecture

The backend follows a layered architecture with clear separation of concerns:

```
Routes → Services → Repositories → Models → Database
```

**Layer Responsibilities**:

1. **Models**: Define data structure, validation, relationships for MongoDB collections
   - User, Student, Room, Assignment, Maintenance, RoomChange, Furniture, Linen, Key, AuditLog

2. **Repositories**: Abstract database operations (CRUD, specialized queries)
   - All direct MongoDB queries live here
   - Example: `userRepository.findByUsername()`

3. **Services**: Implement business logic and coordinate between repositories
   - Validate business rules
   - Transform data
   - Call multiple repositories
   - Example: `assignmentService.assignStudent()` checks room capacity, creates assignment, updates occupancy

4. **Routes**: Define HTTP endpoints, handle request/response, apply middleware
   - Map URLs to service methods
   - Apply auth, RBAC, validation middleware
   - Format responses

5. **Middleware**: Intercept requests before routes
   - `auth.js`: Verifies JWT, attaches user to request
   - `rbac.js`: Checks required roles
   - `errorHandler.js`: Catches errors, sends consistent responses

### Request Flow
```
HTTP Request → Global Middleware (CORS, compression, logging)
→ Route Middleware (auth, rbac, validation)
→ Route Handler → Service → Repository → MongoDB
→ Response back through chain
```

---

## Frontend Architecture

### Directory Structure
```
src/
├── components/ui/            # Reusable UI components
├── contexts/AuthContext.tsx  # Authentication state management
├── lib/
│   ├── api.ts                # API service wrapper
│   └── utils.ts              # Utility functions
├── pages/                    # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── RoomsPage.tsx
│   ├── StudentsPage.tsx
│   ├── MaintenancePage.tsx
│   ├── RoomChangesPage.tsx
│   ├── InventoryPage.tsx
│   └── UserManagementPage.tsx
├── types/api.ts              # TypeScript type definitions
├── App.tsx                   # Root component
└── main.tsx                  # Entry point
```

### Architecture Pattern: Component-Based with Context API

```
Pages → Components → Context → Service Layer → Type Definitions
```

**Key Concepts**:

1. **React Components**: Reusable UI building blocks (Pages, UI Components, Layout Components)
2. **State Management**: 
   - Local state via `useState`
   - Global auth state via `AuthContext`
3. **API Service (`api.ts`)**: Centralized API communication
   - Automatic token inclusion
   - Token refresh on 401
   - Standardized error handling
   - Type-safe requests/responses
4. **AuthContext**: Manages authentication state
   - Provides user, token, login, logout, hasRole
   - Persists to localStorage
   - Normalizes role names (backend "Dorm Admin" → frontend "dorm_admin")
5. **RouteGuards**: Protect routes based on auth and roles
6. **TypeScript Types**: Define data shapes for type safety

### Component Hierarchy
```
App → AuthProvider → RouteGuards → DashboardLayout → Page Components
```

---

## Authentication & Authorization Flow

### Login Flow
1. User enters credentials in LoginPage
2. Frontend calls `apiService.login()`
3. Backend: authRoutes validates with Joi, calls authService.login()
4. Service finds user, compares password hash, generates JWT tokens (access + refresh)
5. Frontend stores tokens in localStorage, user in context
6. Redirects to dashboard

### Token Refresh Flow
1. API request fails with 401
2. api.ts calls `/api/auth/refresh` with refresh token
3. Backend validates refresh token, generates new access token
4. Frontend updates localStorage, retries original request
5. If refresh fails, redirects to login

### Authorization Flow (RBAC)
1. Request reaches backend
2. auth middleware verifies JWT, attaches user to request
3. rbac middleware checks required roles vs user role
4. If authorized: route handler executes
5. If unauthorized: returns 403 Forbidden

### Frontend Authorization
- Pages use `useAuth()` hook and `hasRole()` function
- Conditionally render UI based on role
- Example: `{isAdmin && <Button>Delete</Button>}`

### Role Hierarchy
```
System Admin (highest) → Management → Dorm Admin → Maintenance Staff → Student (lowest)
```

---

## Data Flow Between Frontend and Backend

### Create Operation Example (Creating a Room)
1. User fills form in RoomsPage
2. Component calls `apiService.createRoom(data)`
3. api.ts adds auth token, sends POST /api/rooms
4. Backend: auth middleware → rbac → Joi validation → roomService.createRoom()
5. Service validates business rules, calls roomRepository.create()
6. Repository saves to MongoDB, returns document
7. Service logs audit entry, returns success
8. Route sends { success: true, data: room }
9. Frontend shows success toast, refreshes room list

### Read Operation Example (Fetching Rooms)
1. RoomsPage useEffect calls `loadRooms()`
2. api.ts sends GET /api/rooms with auth token
3. Backend validates auth, calls roomService.getAllRooms()
4. Repository queries MongoDB with filters
5. Returns array of rooms
6. Frontend setsRooms(result.data), component re-renders

### Error Handling Flow
1. Error occurs in backend
2. errorHandler middleware catches, logs, determines error type
3. Returns { success: false, error: message } with appropriate status code
4. Frontend api.ts parses error
5. Component checks result.success, shows toast.error(result.error)

---

## Database Schema

### Collections

**users**: Authentication accounts
- `_id`, fullName, username, email, password (hashed), role, status, studentId, lastLogin
- Indexes: username (unique), email (unique)

**students**: Student profiles
- `_id`, studentId (unique), fullName, gender, department, year, phone, email, userId
- Indexes: studentId (unique)

**rooms**: Dormitory rooms
- `_id`, roomId (unique), building, floor, roomNumber, capacity, currentOccupancy, type, status, genderRestriction, amenities
- Indexes: roomId (unique), building+floor, status

**assignments**: Student-room assignments
- `_id`, student (ref), room (ref), assignedAt, assignedBy (ref), status
- Indexes: student (unique for active), room, status

**maintenance_requests**: Maintenance tickets
- `_id`, requestId (unique), room (ref), submittedBy (ref), assignedTo (ref), category, priority, status, description, resolutionNotes, submittedAt, trackingNumber
- Indexes: requestId, submittedBy, assignedTo, status

**room_changes**: Room change requests
- `_id`, student (ref), currentRoom (ref), requestedRoom (ref), reason, description, status, submittedAt, reviewedBy (ref), rejectionReason
- Indexes: student, currentRoom, status

**furniture**: Room furniture inventory
- `_id`, roomId (ref), itemName, quantity, condition, lastUpdated
- Indexes: roomId+itemName

**linen**: Linen issuance records
- `_id`, studentId, items[], dateIssued, issuedBy (ref)
- Indexes: studentId, dateIssued

**keys**: Key tracking
- `_id`, keyCode (unique), room (ref), student (ref), dateIssued, status
- Indexes: keyCode, room, student

**audit_logs**: System action logs
- `_id`, user (ref), action, entityType, entityId, details, timestamp
- Indexes: user, timestamp, entityType+entityId

### Relationships
- User (1:1) → Student
- Assignment (N:1) → Student, Room
- Maintenance (N:1) → Room, User (submittedBy), User (assignedTo)
- RoomChange (N:1) → Student, Room (current), Room (requested)

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Authenticate, receive tokens
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `PATCH /api/users/:id/deactivate` - Deactivate user
- `PATCH /api/users/:id/reactivate` - Reactivate user
- `POST /api/users/:id/reset-password` - Reset password

### Rooms
- `GET /api/rooms` - List rooms with filters
- `POST /api/rooms` - Create room
- `PATCH /api/rooms/:id` - Update room
- `PATCH /api/rooms/:id/status` - Update status
- `DELETE /api/rooms/:id` - Delete room

### Students
- `GET /api/students` - Student directory
- `GET /api/students/unassigned` - Unassigned students
- `POST /api/students` - Create student

### Assignments
- `POST /api/assignments` - Assign student to room
- `GET /api/assignments/student/:studentId` - Get student assignment
- `GET /api/assignments/room/:roomId` - Get room assignments
- `DELETE /api/assignments/:id` - Remove assignment
- `POST /api/assignments/auto-allocate` - Auto-assign students

### Maintenance
- `GET /api/maintenance` - List requests
- `GET /api/maintenance/my-tasks` - Get assigned tasks
- `GET /api/maintenance/student/:studentId` - Get student requests
- `POST /api/maintenance` - Submit request
- `PATCH /api/maintenance/:id/status` - Update status

### Room Changes
- `GET /api/room-changes` - List requests
- `GET /api/room-changes/my-requests` - Get my requests
- `POST /api/room-changes` - Submit request
- `POST /api/room-changes/:id/approve` - Approve with room assignment
- `POST /api/room-changes/:id/reject` - Reject with reason

### Inventory
- `GET /api/inventory/furniture/:roomId` - Get room furniture
- `POST /api/inventory/furniture` - Add furniture
- `PATCH /api/inventory/furniture/:id` - Update furniture
- `POST /api/inventory/linen/issue` - Issue linen
- `GET /api/inventory/keys/missing` - Get missing keys
- `POST /api/inventory/keys/issue` - Issue key
- `POST /api/inventory/keys/:id/return` - Return key

### Reports
- `GET /api/reports/occupancy` - Occupancy statistics
- `GET /api/reports/student-directory` - Student directory report
- `GET /api/reports/maintenance` - Maintenance report
- `GET /api/reports/export` - Export report (xlsx, pdf, csv)

---

## Key Business Flows

### Student Room Assignment
**Manual Assignment**:
1. Admin creates student account and profile
2. Admin selects available room in RoomsPage
3. Admin assigns student via assignment form
4. Backend validates: room available, student unassigned, capacity not exceeded, gender matches
5. Assignment created, room occupancy incremented, audit log created

**Automatic Assignment**:
1. Admin clicks "Auto Allocate" in StudentsPage
2. Filters by gender, year, department (optional)
3. Backend finds unassigned students, available rooms
4. Algorithm assigns based on capacity, prioritizes partially filled rooms
5. Returns summary, audit log created

### Maintenance Request
1. Student submits request via MaintenancePage (room, category, priority, description, optional photo)
2. Backend creates request with status "Submitted", generates tracking number
3. Admin reviews, assigns to maintenance staff (optional)
4. Status updated to "In Progress"
5. Maintenance staff completes task, adds resolution notes
6. Status updated to "Completed"
7. Student views completion status

### Room Change Request
1. Student (with active assignment) submits request via RoomChangesPage
2. Selects reason (Conflict, Maintenance, Health, Other), provides description
3. Backend creates request with status "Pending", records current room
4. Admin reviews pending requests
5. **Approve**: Selects new room from available, backend creates new assignment, deactivates old, updates occupancies
6. **Reject**: Provides reason, status updated to "Rejected"
7. Student sees updated status

### Inventory Management
**Furniture**:
- Admin selects room, views furniture list
- Add items: type, quantity, condition (Good, Fair, Damaged, Missing)
- Edit items, mark as missing
- Changes logged

**Linen**:
- Admin issues linen to student (student ID, items list)
- Record created with date and issuer

**Keys**:
- Admin issues key (student ID, room ID, key code)
- Key marked "Issued"
- On return: marked "Returned"
- Missing keys view shows unreturned keys

### User Management
1. Admin creates user: name, email, role, student ID (if student), temp password option
2. If temp password: random password generated, displayed one-time
3. Admin can edit, deactivate, reactivate, reset password
4. Role determines system access

---

## Security Considerations

### Authentication Security
- Passwords hashed with bcryptjs (never plain text)
- JWT tokens: Access (15 min), Refresh (7 days)
- Tokens signed with secret key
- Production: Use httpOnly cookies instead of localStorage

### Authorization Security
- RBAC enforced on both frontend and backend
- Backend is authoritative source
- Middleware chain: auth → rbac → validation → handler

### Input Validation
- Joi schemas validate all input before processing
- Type checking, required fields, format validation
- Custom validators for business rules
- Mongoose ODM prevents NoSQL injection

### API Security
- CORS configured for trusted domains
- Rate limiting on login endpoint
- Helmet middleware sets secure headers (HSTS, X-Frame-Options)

### Data Security
- Passwords never sent in responses
- Tokens only over HTTPS
- Sensitive actions logged in audit_logs
- Soft deletes (deactivate instead of delete)

### Frontend Security
- React automatically escapes JSX (XSS prevention)
- Protected routes check authentication
- Role-based route guards
- Clear tokens on logout

---

## Deployment Architecture

### Development
- Frontend: Vite dev server (port 5173)
- Backend: Node.js + Nodemon (port 5000)
- Database: MongoDB (local or cloud)

### Production (Recommended)
```
Load Balancer → Frontend (CDN) + Backend (PM2) → MongoDB (Atlas)
```

**Frontend Deployment**: Vercel/Netlify (build `dist/`, automatic HTTPS, CDN)
**Backend Deployment**: Render/Heroku (environment variables: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, NODE_ENV)
**Database**: MongoDB Atlas (managed service, automatic backups, IP whitelist)

**Environment Variables**:
- Backend: PORT, MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, NODE_ENV, FRONTEND_URL
- Frontend: VITE_API_BASE_URL

**Monitoring**: Morgan logs, custom logger, consider Sentry for error tracking
**Backups**: MongoDB Atlas automatic continuous backups, daily backups with mongodump for self-hosted

---

This architecture document provides a comprehensive technical overview of the ODU-DMS system, detailing the technology stack, architecture patterns, data flows, business logic, and security measures implemented throughout the application.
