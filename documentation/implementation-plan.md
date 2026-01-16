# Implementation Plan - Container Fill-Level Tracking System

## Overview

This document provides step-by-step instructions for implementing the Container Fill-Level Tracking System for recycling centers. The system allows users to declare container status (empty/full), managers to administer containers and facilities, and provides real-time updates and audit trails.

**Core Features:**

- Multi-recycling center support
- Container fill-level tracking (empty/full binary status)
- Real-time status updates via WebSocket
- User authentication and role-based access control
- Anti-spam and throttling mechanisms
- Comprehensive audit logging
- Manager dashboard with statistics and alerts

Each step includes specific tasks and validation tests to ensure correct implementation.

---

## Phase 1: Environment Setup

### Step 1.1: Initialize Project Structure

**Task**: Create the base folder structure with three main directories: frontend, api, and infra.

**Instructions**:

1. Create a root directory named `management-waste-center`
2. Inside the root, create three subdirectories: `frontend`, `api`, `infra`
3. Create a `documentation` folder for project documentation
4. Create a `scripts` folder for automation scripts
5. Create a `.gitignore` file at the root level

**Validation Test**:

- Navigate to the project root
- Run `ls` or `dir` command
- Verify that all five directories exist (frontend, api, infra, documentation, scripts)
- Verify `.gitignore` file exists

---

### Step 1.2: Setup MongoDB Database

**Task**: Install and configure MongoDB as the data persistence layer.

**Instructions**:

1. Create a `docker-compose.mongodb.yml` file in the project root
2. Configure a MongoDB service using the `mongo:7` Docker image
3. Expose port 27017 for local access
4. Configure a named volume for data persistence
5. Set the initial database name to `waste-management`

**Validation Test**:

- Run `docker-compose -f docker-compose.mongodb.yml up -d`
- Connect to MongoDB using a client (e.g., MongoDB Compass, mongosh)
- Verify connection succeeds on `localhost:27017`
- Verify the `waste-management` database appears in the list

---

## Phase 2: Backend API Implementation

### Step 2.1: Initialize Node.js API Project

**Task**: Set up a Node.js project with TypeScript support.

**Instructions**:

1. Navigate to the `api` directory
2. Initialize a new npm project with a `package.json` file
3. Install core dependencies: express, mongoose, dotenv, cors, helmet, morgan
4. Install TypeScript and its type definitions as dev dependencies
5. Create a `tsconfig.json` file with CommonJS module configuration
6. Set the output directory to `dist` and source directory to `src`

**Validation Test**:

- Run `npm install` in the api directory
- Verify `node_modules` folder is created
- Run `npx tsc --version` to confirm TypeScript is installed
- Verify the `tsconfig.json` file compiles without errors

---

### Step 2.2: Create Database Connection Module

**Task**: Implement MongoDB connection logic with error handling.

**Instructions**:

1. Create a `src/config` directory
2. Create a `database.ts` file inside `src/config`
3. Implement an async function that connects to MongoDB using Mongoose
4. Read the MongoDB URI from environment variables with a fallback default
5. Add error handling that logs connection errors and exits the process
6. Add a success message when connection is established

**Validation Test**:

- Create a `.env` file with `MONGODB_URI=mongodb://localhost:27017/waste-management`
- Import and call the connection function from a test file
- Verify the console shows "MongoDB connected successfully"
- Intentionally provide a wrong URI and verify the error message appears

---

### Step 2.3: Define Core Data Models

**Task**: Create Mongoose schemas for all core entities with validation.

**Instructions**:

1. Create a `src/models` directory
2. Create `User.ts` file with schema:
   - `email`: required, unique, string
   - `passwordHash`: required, string
   - `role`: required, enum (visitor, user, agent, manager, superadmin), default user
   - `centerIds`: array of ObjectIds (associated recycling centers)
   - `preferences`: object with locale
   - `createdAt`, `lastLoginAt`: dates
3. Create `RecyclingCenter.ts` file with schema:
   - `name`: required, string
   - `address`: required, string
   - `geo`: object with lat/lng coordinates
   - `publicVisibility`: boolean, default true
   - `openingHours`: array of objects (day, open, close times)
   - `active`: boolean, default true
   - `createdAt`, `updatedAt`: dates
4. Create `ContainerType.ts` file with schema:
   - `label`: required, string (e.g., "Bois", "Gravats", "Carton")
   - `icon`: string (icon identifier)
   - `color`: string (hex color)
   - `createdAt`: date
5. Create `Container.ts`Authentication System
**Task**: Build JWT-based authentication with user registration and login.

**Instructions**:

1. Install additional packages: bcryptjs, jsonwebtoken
2. Create `src/controllers/auth.controller.ts` file
3. Implement `register` function that:
   - Validates email and password from request body
   - Checks if email already exists (return 409 if exists)
   - Hashes password using bcrypt with salt rounds 10
   - Creates new User document with role "user"
   - Returns HTTP 201 with user data (excluding password)
4. Implement `login` function that:
   - Validates email and password from request body
   - Finds user by email (return 401 if not found)
   - Compares password with stored hash using bcrypt
   - Generates JWT access token (expires in 1 hour) with payload: userId, role
   - Generates JWT refresh token (expires in 7 days)
   - Updates user's lastLoginAt timestamp
   - Returns tokens and user data
5. Implement `refreshToken` function that:
   - Validates refresh token from request body
   - Verifies token signature and expiration
   - Generates new access token
   - Returns new access token
6. Implement `logout` function that:
   - Invalidates tokens (can use token blacklist or just client-side removal)
   - Returns success message
7. Create `src/middleware/auth.middleware.ts` file
8. Implement `authenticate` middleware that:
   - Extracts token from Authorization header (Bearer token)
   - Verifies JWT token signature and expiration
   - Decodes token and attaches user data to request object
   - Returns 401 if token is invalid or missing
9. Implement `authorize(...roles)` middleware factory that:
   - Checks if authenticated user's role is in allowed roles
   - Returns 403 if user doesn't have required role
   - Calls next() if authorized

**Validation Test**:

- POST to `/api/auth/register` with email and password
- Verify user is created and password is hashed (not plain text)
- Try registering same email again and verify 409 conflict
- POST to `/api/auth/login` with correct credentials
- Verify tokens are returned (accessToken, refreshToken)
- Try login with wrong password and verify 401
- Make request to protected endpoint with valid token in header
- Verify request succeeds
- Make request without token and verify 401
- Make request with expired token and verify 401
- Test role-based access: user trying to access manager endpoint returns 403SET_FULL")
  - `entityType`: required, enum (container, center, type, user)
  - `entityId`: required, ObjectId
  - `metadata`: object for additional context
  - `createdAt`: required date

**Validation Test**:

- Create test scripts that instantiate each model with valid data
- Verify all documents save successfully to the database
- Test required field validation (missing fields should fail)
- Test enum validation (invalid values should fail)
- Verify references use valid ObjectIds

---

### Step 2.4: Implement Recycling Center Management

**Task**: Build CRUD operations for recycling centers (manager/superadmin only).

**Instructions**:

1. Create `src/controllers/center.controller.ts` file
2. Implement `getAllCenters` function that:
   - Queries all recycling centers with active=true
   - If user role is visitor/user, filter by publicVisibility=true
   - If user has centerIds (manager), filter to only their assigned centers
   - Returns HTTP 200 with array of centers
3. Implement `getCenterById` function that:
   - Extracts center ID from URL parameters
   - Checks user has access to this center (manager must be assigned)
   - Finds center by ID and active=true
   - Returns HTTP 404 if not found, or HTTP 200 with center
4. Implement `createCenter` function (manager/superadmin only) that:
   - Validates center data from request body (name, address, geo coordinates)
   - Validates required fields: name, address, geo.lat, geo.lng
   - Creates new RecyclingCenter document with active=true, publicVisibility=true
   - Creates audit log entry with action "CENTER_CREATED"
   - Returns HTTP 201 with created center
5. Implement `updateCenter` function (manager/superadmin only) that:
   - Extracts center ID and update data from request
   - Validates user manages this center (centerIds includes this center)
   - Updates center document with new data
   - Creates audit log entry with action "CENTER_UPDATED"
   - Returns HTTP 200 with updated center
6. Implement `deleteCenter` function (superadmin only) that:
   - Extracts center ID from URL parameters
   - Checks if center has any active containers
   - If containers exist, return 409 conflict with message
   - If no containers, set active=false (soft delete)
   - Creates audit log entry with action "CENTER_DELETED"
   - Returns HTTP 200 with success message
7. Create routes file `src/routes/center.routes.ts`:
   - GET `/` → getAllCenters (authenticated)
   - GET `/:id` → getCenterById (authenticated)
   - POST `/` → createCenter (manager, superadmin)
   - PUT `/:id` → updateCenter (manager, superadmin)
   - DELETE `/:id` → deleteCenter (superadmin)
8. Mount routes in server at `/api/centers`

**Validation Test**:

- GET all centers and verify public centers are visible to regular users
- Login as manager and verify only assigned centers are returned
- GET center by ID and verify access control works
- Create a new center with valid data and verify 201 response
- Try creating center with missing required fields and verify 400
- Update center details and verify changes persist
- Try updating center as manager not assigned to it and verify 403
- Try deleting center with containers and verify 409 conflict
- Delete center without containers and verify soft delete (active=false)
- Verify audit logs are created for all operations

---

### Step 2.5: Implement Container Type Management

**Task**: Build CRUD operations for container types (manager/superadmin only).

**Instructions**:

1. Create `src/controllers/containerType.controller.ts` file
2. Implement `getAllTypes` function that:
   - Queries all container types
   - Returns HTTP 200 with array (accessible to all authenticated users)
3. Implement `createType` function (manager/superadmin only) that:
   - Validates type data (label, icon, color)
   - Creates new ContainerType document
   - Creates audit log entry
   - Returns HTTP 201 with created type
4. Implement `updateType` function (manager/superadmin only) that:
   - Updates type document
   - Creates audit log entry
   - Returns HTTP 200 with updated type
5. Implement `deleteType` function (manager/superadmin only) that:
   - Checks if type is used by any containers
   - If used, return 409 conflict with message
   - If not used, delete the type
   - Creates audit log entry
   - Returns HTTP 200 with success message
6. Create routes file `src/routes/containerType.routes.ts`:
   - GET `/` → getAllTypes (authenticated)
   - POST `/` → createTyContainer Management with Business Rules
**Task**: Build container CRUD with state management and validation.

**Instructions**:

1. Create `src/controllers/container.controller.ts` file
2. Implement `getContainersByCenter` function that:
   - Extracts centerId from URL parameters
   - Validates user has access to this center
   - Accepts optional query parameter: state (empty, full, maintenance)
   - Queries containers for the center with filters
   - Populates typeId with container type details
   - Returns HTTP 200 with array of containers
3. Implement `getContainerById` function that:
   - Extracts container ID from parameters
   - Validates user has access to container's center
   - Finds container and populates type and center details
   - Returns HTTP 404 if not found, or HTTP 200 with container
4. Implement `createContainer` function (manager/superadmin only) that:
   - Validates container data (centerId, typeId, label, capacity)
   - Validates manager has access to the center
   - Creates new Container document with state="empty"
   - Creates aImplement Status Declaration with Anti-Spam
**Task**: Build the core feature - declaring container status with throttling.

**Instructions**:

1. Install Redis client: ioredis
2. Create `src/config/redis.ts` with Redis connection configuration
3. In `container.controller.ts`, implement `declareStatus` function that:
   - Extracts containerId from URL parameters
   - Extracts newState (empty/full) and optional comment from request body
   - Validates user is authenticated
   - Validates container exists and is active
   - **Anti-spam check**: Check if same user declared status on same container in last 60 seconds
     - Use Redis key: `throttle:{userId}:{containerId}` with TTL 60
     - If key exists, return 409 CONFLICT_THROTTLED with message
     - If not, proceed and set the Redis key
   - **Maintenance check**: If container state is "maintenance":
     - Only allow manager/superadmin roles to declare
     - Regular users get 422 UNPROCESSABLE_STATE
   - Create StatusEvent document with:
     - containerId, newState, authorId (current user)
     - source based on user role (user, agent, manager)
     - comment if provided
     - confidence=1.0, createdAt=now
   - Update Container's state to newState and updatedAt
   - Create audit log entry with action "CONTAINER_SET_EMPTY" or "CONTAINER_SET_FULL"
   - Return HTTP 200 with updated container state and timestamp
4. Create helper function `getCurrentState(containerId)` that:
   - Gets the last valid StatusEvent for the container
   - Returns the newState from that event
   - Used for displaying current status
5. Optional: Implement `getStatusWithQuorum(containerId, N)` function that:
   - Gets last N status events within 2-hour window
   - Calculates majority state (empty vs full)
   - Returns the consensus state
   - Used if quorum feature is enabled
6. Add route to `container.routes.ts`:
   - POST `/:id/status` → declareStatus (user, agent, manager, superadmin)

**Validation Test**:

- Declare a container as "full"
- Verify StatusEvent is created
- Verify Container state is updated to "full"
- Verify audit log entry is created
- Try declaring same container again within 60 seconds
- Verify 409 conflict with throttle message
- Wait 60 seconds and try again, verify it works
- Set container to maintenance mode
- Try declaring status as regular user and verify 422
- Declare status as manager and verify it works
- Verify Redis keys are set and expire correctly
**Validation Test**:
- Create containers for a recycling center with different types
- Verify containers are created with state="empty"
- Get containers by center and verify filtering by state works
- Update container's label and verify change persists
- Set container to maintenance mode
- Verify contaImplement Status History and Timeline
**Task**: Build endpoints to view container status history.

**Instructions**:

1. In `container.controller.ts`, implement `getStatusHistory` function that:
   - Extracts containerId from URL parameters
   - Validates user has access to container's center
   - Accepts query parameters: limit (default 100), from (date), to (date)
   - Queries StatusEvent collection filtered by containerId and date range
   - Sorts by createdAt descending (most recent first)
   - Populates authorId with user details (email, role)
   - Returns HTTP 200 with array of status events
2. Implement `getRecentActivity` function (manager dashboard) that:
   - Accepts query parameter: centerId (optional, filter by center)
   - Validates manager has access to requested centers
   - Queries recent StatusEvents (last 24 hours or configurable)
   - Joins with Container and User data
   - Returns timeline of recent status changes
   - Returns HTTP 200 with array of activity items
3. Add routes to `container.routes.ts`:
   - GET `/:id/events` → getStatusHistory (authenticated)
   - GET `/activity/recent` → getRecentActivity (manager, superadmin)

**Validation Test**:

- Create several status declarations for a container
- GET status history and verify all events are returned
- Verify events are sorted by most recent first
- Test date filtering with from/to parameters
- Verify only events in date range are returned
- Test pagination with limit parameter
- Login as manager and get recent activity
- Verify activity shows events from all containers
- Filter by specific center and verify filtering workfirst)
- Test filtering by adding query parameters (e.g., `?status=collected`)
- Verify only matching records are returned
- GET request with valid ID returns the specific waste
- GET request with non-existent ID returns 404

---

### Step 2.6: Implement Real-Time Updates with Socket.IO

**Task**: Add WebSocket support for real-time container status updates.

**Instructions**:

1. Install Socket.IO: socket.io
2. Create `src/config/socket.ts` file
3. Import Socket.IO and set up with Express server
4. Configure CORS for WebSocket connections
5. Implement socket authentication middleware that:
   - Validates JWT token from socket handshake auth or query
   - Attaches user data to socket
   - Rejects connection if invalid token
6. Create socket event handlers:
   - `connection`: Log when client connects
   - `disconnect`: Log when client disconnects
   - `join:center`: Allow client to subscribe to center updates
   - `leave:center`: Allow client to unsubscribe
7. Create helper function `emitStatusUpdate(containerId, state, updatedAt)`:
   - Gets container details including centerId
   - Emits event `container.status.updated` to room `center:{centerId}`
   - Payload: { containerId, state, updatedAt, containerLabel }
8. Integrate Socket.IO emission in `declareStatus` controller:
   - After successfully updating container state
   - Call emitStatusUpdate function
   - Broadcast to all connected clients watching that center
9. Modify `src/server.ts` to initialize Socket.IO:
   - Create HTTP server from Express app
   - Attach Socket.IO to HTTP server
   - Export io instance for use in controllers

**Validation Test**:

- Start server and verify Socket.IO initializes
- Connect a WebSocket client (use socket.io-client or Postman)
- Verify connection succeeds with valid JWT token
- Verify connection is rejected with invalid token
- Emit `join:center` event with a centerId
- In another client, declare container status for that center
- Verify first client receives `container.status.updated` event
- Verify payload contains correct containerId and state
- Emit `leave:center` and verify client stops receiving updates
- Test with mulImplement Manager Dashboard Statistics
**Task**: Build analytics endpoints for manager dashboard.

**Instructions**:

1. Create `src/controllers/dashboard.controller.ts` file
2. Implement `getCenterStats` function (manager/superadmin only) that:
   - Extracts centerId from query parameter (optional)
   - If provided, validate manager has access
   - If not provided, aggregate across all manager's centers
   - Calculate statistics:
     - Total containers count
     - Containers by state (empty, full, maintenance)
     - Fill rate percentage (full / (empty + full))
     - Containers by type with fill rates
   - Returns HTTP 200 with statistics object
3. Implement `getAlerts` function (manager/superadmin only) that:
   - Finds containers that have been "full" for > configurable threshold (e.g., 6 hours)
   - Queries StatusEvents to find when container became full
   - Calculates time elapsed since last "full" declaration
   - Returns array of containers needing attention
   - Returns HTTP 200 with alerts array
4. Implement `getRotationMetrics` function (manager/superadmin only) that:
   - Calculates average time between "full" → "empty" transitions
   - Groups by container type

### Step 2.12: Implement API Documentation with Swagger

**Task**: Add interactive API documentation using Swagger/OpenAPI.

**Instructions**:

1. Install swagger-jsdoc and swagger-ui-express packages
2. Create `src/config/swagger.ts` file
3. Define OpenAPI 3.0 specification with:
   - API info (title: "Container Fill-Level Tracking API", version, description)
   - Security scheme: BearerAuth (JWT)
   - Server URLs (development and production)
   - Component schemas for:
     - User (email, role, centerIds)
     - RecyclingCenter (name, address, geo, publicVisibility)
     - ContainerType (label, icon, color)
     - Container (label, centerId, typeId, state, capacity)
     - StatusEvent (containerId, newState, authorId, source, comment)
     - StatusDeclaration (newState, comment) - request body
     - Error (message, code, details)
4. Add JSDoc comments above each route handler with Swagger annotations:
   - Document all parameters (path, query, body)
   - Document security requirements (which routes need auth)
   - Document response codes (200, 201, 400, 401, 403, 404, 409, 422)
   - Include example request/response bodies
5. Mount Swagger UI at `/api-docs` endpoint in server.ts
6. Configure swagger to read annotations from route files
7. Add authentication to Swagger UI (Authorize button for Bearer token)

**Validation Test**:

- Navigate to `http://localhost:5000/api-docs` in a browser
- Verify Swagger UI interface loads
- Verify all endpoints are listed with proper HTTP methods and security
- Verify schemas show proper data structures
- Click "Authorize" and enter a valid JWT token
- Test the "declare status" endpoint directly from Swagger UI
- Verify the "Try it out" feature works with authentication
- Check that error responses are documented
- Verify enum values are shown for state and role fields

---

### Step 2.13: Create Database Seeding Script

**Task**: Build a script to populate the database with sample data.

**Instructions**:

1. Create a `src/scripts` directory
2. Create `seed.ts` file
3. Import all models and database connection
4. Define sample data arrays:
   - 2-3 recycling centers (Paris Nord, Paris Sud, etc.)
   - 4-5 container types (Bois, Gravats, Carton, DEEE, Verre)
   - Users with different roles (user, agent, manager, superadmin)
   - 15-20 containers distributed across centers
   - 30-50 status events with varied timestamps
5. Implement seeding function that:
   - Connects to the database
   - Deletes all existing data (in correct order to respect foreign keys)
   - Inserts recycling centers and stores IDs
   - Inserts container types and stores IDs
   - Inserts users with hashed passwords (use bcrypt)
   - Inserts containers referencing centers and types
   - Inserts status events referencing containers and users
   - Creates audit log entries for major actions
   - Logs statistics (counts by entity type)
   - Closes the database connection
6. Add a `seed` script to package.json that runs this file with ts-node

**Validation Test**:

- Run `npm run seed`
- Verify console shows connection success message
- Verify console shows number of records inserted per collection
- Query the database to confirm all data exists
- Verify relationships: containers reference valid centers and types
- Verify passwords are hashed (not plain text)
- Try logging in with seeded user credentials
- Verify some containers have state "full", others "empty"
- Check that status events have varied timestamps
- Run the seed script again and verify old data is replaced

  - Returns average rotation time in hours
  - Useful for optimizing collection schedules
  - Returns HTTP 200 with metrics object

1. Create routes file `src/routes/dashboard.routes.ts`:
   - GET `/stats` → getCenterStats (manager, superadmin)
   - GET `/alerts` → getAlerts (manager, superadmin)
   - GET `/metrics/rotation` → getRotationMetrics (manager, superadmin)
2. Mount routes in server at `/api/dashboard`

**Validation Test**:

- Login as manager
- GET dashboard stats and verify counts are accurate
- Verify fill rate percentage is calculated correctly
- Create several containers and set some to full
- Verify alerts endpoint returns containers that are full
- Manually age a "full" status event in database
- Verify it appears in alerts with correct elapsed time
- GET rotation metrics and verify calculations
- Verify data is grouped by container type correctly
- Login as regular user and verify 403 forbiddenms
  - Returns HTTP 404 if not found, or HTTP 200 with success message

**Validation Test**:

- PUT request to update a waste's status
- Verify response contains updated data
- Verify validation still works (e.g., invalid enum value fails)
- DELETE request with valid ID removes the record
- Verify subsequent GET request returns 404
- DELETE request with non-existent ID returns 404

---

### Step 2.7: Implement Statistics Endpoint

**Task**: Create an aggregation endpoint for waste statistics.

**Instructions**:

1. In `waste.controller.ts`, implement `getWasteStats` function that:
   - Counts total number of waste documents
   - Aggregates total weight across all wastes
   - Groups wastes by type with count and total weight per type
   - Groups wastes by status with count per status
   - Returns all statistics in a single JSON response

**Validation Test**:

- GET request to stats endpoint returns a JSON object
- Verify `totalWastes` field shows correct count
- Verify `totalWeight` field shows sum of all weights
- Verify `wastesByType` is an array with objects containing _id, count, totalWeight
- Verify `wastesByStatus` is an array with objects containing _id, count
- Add a new waste and verify counts update correctly

---

### Step 2.8: Implement Authentication UI

**Task**: Build login, registration, and auth context.

**Instructions**:

1. Create `src/context` directory
2. Create `AuthContext.tsx` with React Context for authentication:
   - State: user (with id, email, role), token, isAuthenticated, loading
   - Functions: login(email, password), register(email, password), logout()
   - Store token in localStorage
   - Provide context to entire app
3. Create `src/pages/Login.tsx` component:
   - Material-UI Card with login form
   - Email and password TextField components
   - Login button that calls authContext.login()
   - Link to registration page
   - Show error message if login fails
   - Redirect to dashboard on successful login
4. Create `src/pages/Register.tsx` component:
   - Similar form with email, password, confirm password
   - Validate passwords match
   - Call authContext.register()
   - Show success message and redirect to login
5. Create `src/components/PrivateRoute.tsx`:
   - Wrapper component that checks authentication
   - Redirects to /loCenter Selection and Dashboard
**Task**: Build center selection and overview dashboard for users.

**Instructions**:

1. Create `src/pages/Dashboard.tsx` component
2. Add center selector dropdown at top:
   - Fetch available centers from API
   - Show only centers user has access to
   - Store selected center in state
   - Show nearest center by default (can use geolocation API)
3. Create stats cards section showing:
   - Total containers in selected center
   - Number of full containers (with warning icon if > threshold)
   - Number of empty containers (with success icon)
   - Number in maintenance (with tool icon)
4. Use Material-UI Grid for responsive layout
5. Style cards with appropriate colors:
   - Green for empty
   - Orange/Red for full
   - Gray for maintenance
6. Add "View All Containers" button that navigates to container list

**Validation Test**:

- Navigate to `/` route after login
- Verify center selector shows available centers
- Select a center from dropdown
- Verify stats cards update to show data for selected center
- Verify counts match actual container states
- Verify color coding is appropriate
- Test on mobile viewport and verify responsiveness
- Click "View All Containers" and verify navigation

### Step 2.9: Create Express Server Entry Point

**Task**: Set up the main Express application with middleware and Socket.IO.

**Instructions**:

1. Create `src/server.ts` file
2. Import and configure the following middleware:
   - helmet (security headers)
   - cors (cross-origin requests)
   - morgan (request logging)
   - express.json (parse JSON bodies)
   - express.urlencoded (parse URL-encoded bodies)
3. Connect to database by calling the connection function
4. Initialize Socket.IO with the HTTP server
5. Mount API routes:
   - `/api/auth` → authRoutes
   - `/api/centers` → centerRoutes
   - `/api/container-types` → containerTypeRoutes
   - `/api/containers` → containerRoutes
   - `/api/dashboard` → dashboardRoutes
6. Add a health check endpoint at `/api/health`
7. Mount Swagger UI at `/api-docs`
8. Configure the server to listen on port from environment or default 5000
9. Add error handling middleware at the end

**Validation Test**:

- Run `npm run dev` to start the server
- Verify console shows "Server running on port 5000"
- Verify console shows "MongoDB connected successfully"
- Verify console shows "Socket.IO initialized"
- GET request to `/api/health` returns status 200 with "ok" message
- Verify CORS headers are present in responses
- Check server logs show incoming requests
- Verify WebSocket connection can be established

---

## Phase 3: Frontend Implementation

### Step 3.1: Initialize React Project with Vite

**Task**: Set up the frontend with Vite build tool and TypeScript.

**Instructions**:

1. From project root, create frontend directory
2. Initialize Vite project: `npm create vite@latest frontend -- --template react-ts`
3. Install core dependencies:
   - Material-UI: `@mui/material @emotion/react @emotion/styled`
   - Icons: `@mui/icons-material`
   - Router: `react-router-dom`
   - HTTP client: `axios`
   - Socket.IO client: `socket.io-client`
4. Configure Vite proxy to forward `/api` requests to backend (port 5000)
5. Update `vite.config.ts` with server configuration
6. Create basic folder structure: `src/pages`, `src/components`, `src/services`, `src/context`

**Validation Test**:

- Run `npm install` to install dependencies
- Run `npm run dev` to start development server
- Access `http://localhost:3000` in browser
- Verify Vite welcome page displays
- Verify no console errors
- Verify hot module replacement works (edit a file and see changes)

---

### Step 3.2: Create MUI Theme Configuration

**Task**: Set up a custom Material-UI theme for the container tracking app.

**Instructions**:

1. Create a `src/theme.ts` file
2. Import `createTheme` from Material-UI
3. Define a theme object with:
   - Primary color set to green (#2e7d32) for environmental theme
   - Secondary color set to orange (#ff9800)
   - Light mode palette
4. Export the theme as default
5. Configure standard font family

**Validation Test**:

- Import the theme in a test component
- Verify no TypeScript or import errors
- Temporarily render a Material-UI Button with `color="primary"`
- Verify the button displays in green color
- Render a button with `color="secondary"` and verify orange color

---

### Step 3.3: Create Layout Component with Navigation

**Task**: Build a reusable layout with header navigation.

**Instructions**:

1. Create `src/components` directory
2. Create `Layout.tsx` component
3. Implement a Material-UI AppBar with Toolbar containing:
   - App title "Container Tracking System" or "Gestion des Bennes"
   - Recycling/Delete icon
   - Navigation buttons for "Dashboard" and "Containers"
   - User email and logout button when authenticated
   - WebSocket connection status indicator
4. Use React Router's Link component for navigation
5. Include a `children` prop to render page content
6. Style with flexbox to ensure proper layout

**Validation Test**:

- Wrap the Layout around a sample component
- Verify the header appears at the top
- Verify app title and icon are visible
- Click navigation buttons and verify URL changes
- Verify the layout is responsive (test on narrow screen)

---

### Step 3.4: Set Up React Router with Protected Routes

**Task**: Configure routing for application pages with authentication.

**Instructions**:

1. Modify `src/App.tsx` to include Router setup
2. Wrap application with BrowserRouter
3. Wrap with ThemeProvider and pass custom theme
4. Include CssBaseline for consistent styling
5. Define Routes for:
   - `/login` → Login page (public)
   - `/register` → Register page (public)
   - `/` → Dashboard page (protected)
   - `/containers` → Container list page (protected)
   - `/containers/:id/history` → Container history page (protected)
   - `/manager` → Manager dashboard (protected, manager only)
   - `*` → 404 Not Found page
6. Wrap protected routes within PrivateRoute component
7. Wrap all routes within the Layout component (except login/register)

**Validation Test**:

- Start the application without being logged in
- Navigate to `/` and verify redirect to `/login`
- Navigate to `/containers` and verify redirect to `/login`
- Verify login and register pages are accessible without auth
- After login, verify protected routes are accessible
- Use browser back/forward buttons to verify routing works
- Verify Layout header appears on all protected pages

---

### Step 3.5: Create Dashboard Page with Statistics Cards

**Task**: Build the main dashboard showing key metrics.

**Instructions**:

1. Create `src/pages` directory
2. Create `Dashboard.tsx` component
3. Use Material-UI Grid to create a responsive layout
4. Create three Paper cards displaying:
   - Total wastes processed (with Recycling icon)
   - Monthly evolution percentage (with TrendingUp icon)
   - Collections today count (with LocalShipping icon)
5. Use placeholder/mock data for now
6. Style cards with padding and proper spacing

**Validation Test**:

- Navigate to `/` route
- Verify three metric cards are displayed
- Verify icons appear correctly
- Verify cards are responsive (stack on mobile, row on desktop)
- Resize browser window to test grid responsiveness
- Verify text is readable and properly formatted

---

### Step 3.6: Implement Authentication System

**Task**: Build authentication context, login, registration, and route protection.

**Instructions**:

1. Create `src/context` directory
2. Create `AuthContext.tsx` with React Context for authentication:
   - State: user (id, email, role, centerIds), token, isAuthenticated, loading
   - Functions: login(email, password), register(email, password), logout()
   - Store token in localStorage
   - Auto-load user from token on app initialization
   - Provide context to entire app via AuthProvider
3. Create `src/pages/Login.tsx` component:
   - Material-UI Card with centered login form
   - Email and password TextField components
   - Login button that calls authContext.login()
   - Link to registration page
   - Show error message if login fails (Snackbar or Alert)
   - Redirect to dashboard on successful login
4. Create `src/pages/Register.tsx` component:
   - Similar form with email, password, confirm password fields
   - Validate passwords match before submission
   - Call authContext.register()
   - Show success message and redirect to login page
5. Create `src/components/PrivateRoute.tsx`:
   - Wrapper component that checks authentication status
   - Redirects to /login if user is not authenticated
   - Shows loading spinner while checking auth status
   - Renders children if authenticated
6. Wrap App component with AuthProvider in `main.tsx`

**Validation Test**:

- Try accessing `/` without being logged in
- Verify redirect to `/login` page
- Register a new account with valid email and password
- Verify success message appears
- Login with registered credentials
- Verify redirect to dashboard and user data is loaded
- Verify token is stored in localStorage
- Refresh page and verify user stays logged in
- Logout and verify redirect to login page
- Try login with wrong password and verify error message
- Test "confirm password" validation in registration

---

### Step 3.7: Implement API Client Service

**Task**: Create a service module for API communication.

**Instructions**:

1. Create `src/services` directory
2. Create `api.ts` file
3. Configure axios instance with base URL from environment variable
4. Set default timeout to 10000ms
5. Add request interceptor to attach JWT token to all requests
6. Add response interceptor to handle 401 (redirect to login)
7. Create API functions:
   - **Auth**: `register()`, `login()`, `refreshToken()`, `logout()`
   - **Centers**: `getCenters()`, `getCenterById()`, `createCenter()`, `updateCenter()`, `deleteCenter()`
   - **Container Types**: `getContainerTypes()`, `createContainerType()`, `updateContainerType()`, `deleteContainerType()`
   - **Containers**: `getContainersByCenter()`, `getContainerById()`, `createContainer()`, `updateContainer()`, `declareStatus()`, `getStatusHistory()`, `setMaintenance()`
   - **Dashboard**: `getDashboardStats()`, `getAlerts()`, `getRotationMetrics()`, `getRecentActivity()`
8. Export all functions from api.ts

**Validation Test**:

- Import a function in a test component
- Call an API function and log the result
- Verify the request is sent to correct URL (check browser Network tab)
- If backend is running, verify actual data is returned
- Test error handling by calling API with backend stopped
- Verify promise rejects appropriately
- Verify JWT token is attached to requests

---

### Step 3.8: Create Container List with Status Display

**Task**: Build container grid/list view with real-time status.

**Instructions**:

1. Create `src/pages/ContainerList.tsx` component
2. Add page header with selected center name
3. Fetch containers for selected center from API
4. Create filter bar with:
   - Container type selector (dropdown)
   - Status filter (all, empty, full, maintenance)
   - Search box to filter by label
5. Display containers in Grid layout using Material-UI Card components
6. Each container card shows:
   - Container label and type icon
   - Large status badge (Chip component):
     - Green "VIDE" for empty
     - Red "PLEIN" for full
     - Gray "MAINTENANCE" for maintenance
   - Capacity information
   - Location hint if available
   - Last updated timestamp
7. Add action buttons on each card:
   - "Déclarer Plein" button (if currently empty)
   - "Déclarer Vide" button (if currently full)
   - Buttons disabled if in maintenance
8. Show loading spinner while fetching
9. Show empty state message if no containers

**Validation Test**:

- Navigate to container list page
- Verify containers are displayed in grid
- Verify status badges show correct colors
- Verify action buttons appear based on current state
- Test type filter and verify filtering works
- Test status filter and verify only matching containers shown
- Test search and verify fuzzy matching on labels
- Verify maintenance containers show appropriate UI
- Resize window and verify grid is responsive

---

### Step 3.9: Implement Status Declaration with Confirmation

**Task**: Allow users to declare container status with validation.

**Instructions**:

1. Create state for dialog open/close and selected container
2. When user clicks "Déclarer Plein" or "Déclarer Vide":
   - Open confirmation dialog
   - Show container details
   - Ask "Êtes-vous sûr de vouloir déclarer ce conteneur comme [PLEIN/VIDE] ?"
3. Add optional comment field in dialog (TextArea)
4. On confirmation:
   - Call API to declare status
   - Show loading indicator on button
   - Handle success: close dialog, show snackbar notification, update local state
   - Handle errors:
     - 409 throttle: "Vous avez déjà déclaré ce conteneur récemment"
     - 422 maintenance: "Ce conteneur est en maintenance"
     - Show error in snackbar
5. Optimistically update UI:
   - Immediately update card's status badge
   - Show "updating" indicator
   - Revert if API call fails
6. Add Material-UI Snackbar for notifications:
   - Success: "Statut mis à jour avec succès"
   - Error: Show specific error message
   - Auto-hide after 4 seconds

**Validation Test**:

- Click "Déclarer Plein" on an empty container
- Verify confirmation dialog appears with container details
- Verify comment field is optional
- Confirm declaration and verify success snackbar appears
- Verify container badge updates to "PLEIN" immediately
- Verify action button changes to "Déclarer Vide"
- Try declaring same container again within 60 seconds
- Verify throttle error message appears in snackbar
- Wait 60 seconds and try again, verify it works
- Set a container to maintenance mode
- Try declaring status and verify maintenance error appears
- Verify UI reverts if API call fails

---

### Step 3.10: Real-Time Updates with WebSocket

**Task**: Connect to WebSocket and update UI in real-time.

**Instructions**:

1. Install socket.io-client package
2. Create `src/services/socket.ts` file
3. Initialize Socket.IO client connection:
   - Connect to backend WebSocket server
   - Include JWT token in auth header
   - Handle connection/disconnection events
4. Create hook `useSocket()` that:
   - Returns socket instance
   - Manages connection lifecycle
   - Reconnects automatically on disconnect
5. In `ContainerList.tsx`:
   - Use useSocket hook to get socket instance
   - Subscribe to current center on mount:
     - Emit `join:center` with centerId
   - Listen for `container.status.updated` events
   - When event received:
     - Find container in local state by containerId
     - Update its state and updatedAt
     - Show brief animation or flash to indicate update
   - Unsubscribe on unmount:
     - Emit `leave:center` with centerId
6. Add visual indicator when WebSocket is connected (small dot in header)

**Validation Test**:

- Open container list in browser window 1
- Verify WebSocket connects (check browser console)
- Verify connection indicator appears
- Open container list in browser window 2 (same center)
- In window 1, declare a container as full
- Verify window 2 updates automatically without refresh
- Verify status badge changes color
- Verify animation plays to draw attention
- Disconnect network briefly
- Verify connection indicator shows disconnected
- Restore network and verify reconnection

---

### Step 3.11: Create Container History Timeline

**Task**: Build timeline view showing status change history.

**Instructions**:

1. Create `src/pages/ContainerHistory.tsx` component
2. Route: `/containers/:id/history`
3. Fetch container details and status events from API
4. Display container information at top:
   - Label, type, current state, location
   - Back button to container list
5. Use Material-UI Timeline component to show status events
6. Each timeline item shows:
   - Timestamp (formatted as relative time: "2 heures ago")
   - Status change (Vide → Plein or Plein → Vide)
   - User who declared (name/email)
   - User role badge
   - Comment if provided
   - Icon/color based on new state
7. Sort timeline by most recent first
8. Add pagination or "Load More" button if many events
9. Add date range filter to view history for specific period

**Validation Test**:

- Click on a container from the list
- Verify navigation to history page works
- Verify timeline shows all status events
- Verify events are sorted chronologically (most recent first)
- Verify user information is displayed
- Verify relative timestamps are correct ("2 hours ago")
- Test date filter and verify filtering works
- Create a new status event from another window
- Return to history and verify it appears at top
- Test pagination if implemented

---

### Step 3.12: Implement Geolocation and Nearest Center

**Task**: Add geolocation feature to find nearest recycling center.

**Instructions**:

1. Create helper function `getDistance(lat1, lng1, lat2, lng2)`:
   - Use Haversine formula to calculate distance in km
   - Return distance as number
2. In Dashboard.tsx, add "Find Nearest Center" button
3. On click:
   - Request user's location using browser Geolocation API
   - Handle permission denied gracefully
   - Calculate distance to all accessible centers
   - Sort centers by distance
   - Auto-select nearest center
   - Show distance in km in center selector
4. Add loading indicator while getting location
5. Cache user location in sessionStorage
6. Show map icon next to nearest center option

**Validation Test**:

- Click "Find Nearest Center" button
- Grant location permission
- Verify nearest center is auto-selected
- Verify distance is displayed correctly
- Deny location permission and verify graceful handling
- Verify cached location is used on page refresh
- Test with centers at different locations
- Verify Haversine calculation is accurate (compare with Google Maps)

---

### Step 3.13: Build Manager Dashboard (Admin UI)

**Task**: Create comprehensive dashboard for managers.

**Instructions**:

1. Create `src/pages/ManagerDashboard.tsx` component
2. Protect route with role check (manager or superadmin only)
3. Create tabbed interface with Material-UI Tabs:
   - Tab 1: Statistics
   - Tab 2: Alerts
   - Tab 3: Manage Containers
   - Tab 4: Manage Types
4. **Statistics Tab**:
   - Fetch dashboard stats from API
   - Display KPI cards: total containers, fill rate, by-type breakdown
   - Add Chart.js or Recharts pie chart showing container distribution
   - Show bar chart of fill rates by type
5. **Alerts Tab**:
   - Fetch alerts (containers full for > 6 hours)
   - Display list with container label, type, time since full
   - Highlight urgent alerts (> 12 hours) in red
   - Add "Mark as Resolved" action (declare empty)
6. **Manage Containers Tab**:
   - Table view of all containers with CRUD actions
   - Add container button opens dialog
   - Edit button inline or in dialog
   - Delete button with confirmation
   - Set maintenance mode toggle switch
7. **Manage Types Tab**:
   - List of container types with CRUD
   - Add type dialog with label, icon picker, color picker
   - Delete with validation (check if in use)

**Validation Test**:

- Login as manager
- Navigate to manager dashboard
- Verify all tabs are accessible
- Verify statistics show correct data
- Verify charts render properly
- Check alerts tab shows containers needing attention
- Add a new container type
- Create a container using the new type
- Edit container details
- Toggle maintenance mode and verify container updates
- Try accessing as regular user and verify 403

---

### Step 3.14: Create 404 Not Found Page

**Task**: Build a user-friendly error page for invalid routes.

**Instructions**:

1. Create `NotFound.tsx` in `src/pages`
2. Display a large "404" text
3. Add message "Page non trouvée"
4. Include a button linking back to dashboard
5. Use Material-UI Typography and Button components
6. Center content vertically and horizontally
7. Use theme colors for consistency

**Validation Test**:

- Navigate to `/invalid-route` or any non-existent path
- Verify 404 page appears
- Verify message is clear and readable
- Click "Retour à l'accueil" button
- Verify navigation returns to dashboard
- Verify layout header is still present

---

### Step 3.15: Create Container Types Management Page

**Task**: Build a dedicated page for managing container types with full CRUD operations.

**Instructions**:

1. Create `src/pages/ManageTypes.tsx` component
2. Add route `/manage-types` for managers and superadmins only
3. Implement main layout:
   - Page header with "Manage Container Types" title
   - "Add Type" button in top-right corner
   - Data table showing all container types
4. **Data Table Columns**:
   - Type label (e.g., "Bois", "Gravats", "Carton")
   - Icon preview (small icon display)
   - Color preview (colored chip/circle)
   - Container count (how many containers use this type)
   - Created date
   - Actions (Edit, Delete buttons)
5. **Add/Edit Type Dialog**:
   - Text field for type label (required, max 50 chars)
   - Icon picker with predefined icons (Recycling, Delete, Build, etc.)
   - Color picker for type identification
   - Preview section showing how type will appear
   - Save/Cancel buttons
6. **Delete Confirmation**:
   - Check if type is used by any containers
   - Show warning dialog: "X containers use this type. Delete anyway?"
   - If no containers use it, simple confirmation dialog
   - Cascade delete or prevent deletion based on business rules
7. **API Integration**:
   - Fetch types on page load
   - Create new type with validation
   - Update existing type
   - Delete type with usage check
8. **Error Handling**:
   - Show snackbar notifications for success/error
   - Validate form fields before submission
   - Handle API errors gracefully

**Validation Test**:

- Navigate to `/manage-types` as manager
- Verify table shows all container types
- Click "Add Type" and create new type with label, icon, color
- Verify new type appears in table
- Edit existing type and verify changes save
- Try to delete type used by containers and verify warning
- Delete unused type and verify confirmation dialog
- Try to create type with duplicate label and verify error
- Verify regular users cannot access this page (403/redirect)
- Test form validation (empty label, invalid data)
- Verify container count updates when containers are created/deleted

---

### Step 3.16: Build Container Management CRUD Operations

**Task**: Implement comprehensive container management with full CRUD operations for managers.

**Instructions**:

1. Create `src/pages/ManageContainers.tsx` component
2. Add route `/manage-containers` for managers and superadmins only
3. Implement main layout:
   - Page header with "Gestion des Conteneurs" title
   - "Ajouter Conteneur" button in top-right corner
   - Data table showing all containers with filters
4. **Data Table Columns**:
   - Container label (e.g., "Container-001")
   - Type (with icon and color indicator)
   - Center name
   - Current state (Empty/Full/Maintenance) with color chips
   - Capacity (liters)
   - Location hint
   - Last updated timestamp
   - Actions (Edit, Delete, Toggle Maintenance buttons)
5. **Filters and Search**:
   - Search by container label
   - Filter by center (dropdown)
   - Filter by type (dropdown)
   - Filter by state (All/Empty/Full/Maintenance)
   - Clear filters button
6. **Add/Edit Container Dialog**:
   - Text field for container label (required, unique per center)
   - Center selection dropdown (based on user's assigned centers)
   - Container type selection dropdown
   - Capacity input (number, optional, default based on type)
   - Location hint text field (optional, max 100 chars)
   - Initial state selection (Empty/Full, default Empty)
   - Form validation with error messages
   - Save/Cancel buttons
7. **Delete Confirmation**:
   - Show confirmation dialog with container details
   - Warning about status history loss
   - Option to archive instead of permanent delete
   - Prevent deletion if container has recent activity (< 24h)
8. **Maintenance Mode Toggle**:
   - Quick toggle button in actions column
   - Confirmation dialog for maintenance mode changes
   - Visual indication of maintenance state
   - Disable status changes when in maintenance
9. **Bulk Operations**:
   - Checkbox selection for multiple containers
   - Bulk actions: Set Maintenance, Change Center, Delete
   - Progress indicator for bulk operations
   - Success/error summary after completion
10. **API Integration**:
    - Fetch containers with pagination and filters
    - Create new container with validation
    - Update existing container details
    - Delete container with cascade options
    - Toggle maintenance mode
    - Real-time updates via WebSocket for state changes
11. **Error Handling**:
    - Show snackbar notifications for all operations
    - Validate unique container labels per center
    - Handle API errors gracefully with retry options
    - Loading states for all async operations

**Validation Test**:

- Navigate to `/manage-containers` as manager
- Verify table shows containers for manager's assigned centers
- Test search functionality with partial container labels
- Apply different filters and verify results
- Click "Add Container" and create new container
- Verify new container appears in table with correct details
- Edit existing container and save changes
- Toggle maintenance mode and verify state updates
- Try to create container with duplicate label (same center)
- Test bulk selection and bulk maintenance toggle
- Delete container and verify confirmation dialog
- Try to delete container with recent activity
- Verify regular users cannot access page (403/redirect)
- Test form validation (empty required fields, invalid capacity)
- Verify real-time updates when container states change
- Test pagination with large number of containers

---

### Step 3.17: Create Recycling Centers Management Page

**Task**: Build a dedicated page for managing recycling centers with full CRUD operations for superadmins.

**Instructions**:

1. Create `src/pages/ManageCenters.tsx` component
2. Add route `/manage-centers` for superadmins only
3. Implement main layout:
   - Page header with "Gestion des Centres de Recyclage" title
   - "Ajouter Centre" button in top-right corner
   - Data table showing all recycling centers with filters
4. **Data Table Columns**:
   - Center name (e.g., "Déchetterie de Lyon Nord")
   - Address (full address)
   - Status badge (Active/Inactive) with color indicators
   - Public visibility indicator (Public/Private)
   - Coordinates (lat, lng) with map icon link
   - Number of containers assigned
   - Created date
   - Actions (Edit, Delete, Toggle Active Status buttons)
5. **Filters and Search**:
   - Search by center name or address
   - Filter by status (All/Active/Inactive)
   - Filter by visibility (All/Public/Private)
   - Clear filters button
6. **Add/Edit Center Dialog**:
   - Text field for center name (required, max 100 chars)
   - Text area for full address (required, max 255 chars)
   - Coordinate inputs for latitude and longitude (required, with validation)
   - Map integration for selecting coordinates (optional enhancement)
   - Public visibility toggle switch
   - Opening hours configuration (days of week with open/close times)
   - Active status toggle (for edit mode)
   - Form validation with error messages
   - Save/Cancel buttons
7. **Delete Confirmation**:
   - Show confirmation dialog with center details
   - Warning about assigned containers and users
   - Check if center has active containers or assigned managers
   - Prevent deletion if dependencies exist, offer soft delete (set active=false)
   - Show impact summary (X containers, Y managers affected)
8. **Coordinate Validation**:
   - Latitude validation: -90 to +90 degrees
   - Longitude validation: -180 to +180 degrees
   - Optional: Reverse geocoding to validate address matches coordinates
   - Visual feedback for invalid coordinates
9. **Opening Hours Management**:
   - Day selector with time pickers for open/close times
   - Support for "Closed" days
   - Validation for logical time ranges (open < close)
   - Multiple time slots per day support (morning/afternoon)
10. **API Integration**:
    - Fetch centers with pagination and filters
    - Create new center with coordinate and address validation
    - Update existing center details
    - Soft delete center (set active=false) with dependency checks
    - Toggle active status with audit logging
11. **Error Handling**:
    - Show snackbar notifications for all operations
    - Validate unique center names
    - Handle API errors gracefully with retry options
    - Loading states for all async operations
    - Geographic validation errors (invalid coordinates)

**Validation Test**:

- Navigate to `/manage-centers` as superadmin
- Verify only superadmins can access this page (403 for others)
- Verify table shows all recycling centers with correct data
- Test search functionality with center names and addresses
- Apply different filters and verify results work correctly
- Click "Add Center" and create new center with valid data
- Verify coordinate validation works (reject invalid lat/lng)
- Test address validation and required field enforcement
- Verify new center appears in table with correct details
- Edit existing center and save changes
- Test opening hours configuration with multiple time slots
- Toggle active status and verify state updates
- Try to create center with duplicate name and verify error
- Test delete confirmation for centers with/without containers
- Verify soft delete functionality (active=false)
- Verify managers and regular users cannot access page
- Test form validation (empty required fields, invalid coordinates)
- Verify API error handling and user feedback
- Test bulk operations if implemented

---

## Phase 4: Infrastructure and Deployment

### Step 4.1: Create Frontend Dockerfile

**Task**: Containerize the React application for production.

**Instructions**:

1. Create `Dockerfile` in frontend directory
2. Use multi-stage build with node:18-alpine base image
3. First stage: build the application
   - Copy package files and install dependencies
   - Copy source code
   - Run build command
4. Second stage: serve with nginx:alpine
   - Copy built files from first stage to nginx html directory
   - Copy nginx configuration
5. Expose port 80

**Validation Test**:

- Build the Docker image: `docker build -t waste-frontend .`
- Verify build completes without errors
- Run container: `docker run -p 3000:80 waste-frontend`
- Access `http://localhost:3000` in browser
- Verify application loads and functions
- Stop and remove container

---

### Step 4.2: Create Frontend Nginx Configuration

**Task**: Configure Nginx to serve React app and proxy API requests.

**Instructions**:

1. Create `nginx.conf` file in frontend directory
2. Configure server block listening on port 80
3. Set root to nginx html directory
4. Configure location `/` to try files or fallback to index.html (for SPA routing)
5. Configure location `/api` to proxy to backend service on port 5000
6. Add CORS headers for API proxy
7. Enable gzip compression for static assets

**Validation Test**:

- Build and run frontend container
- Verify root path serves the React app
- Verify React Router paths work (no 404 for /wastes route)
- Verify gzip compression is active (check response headers)
- Test API proxy by making request to `/api/health`
- Verify request is forwarded to backend

---

### Step 4.3: Create Backend Dockerfile

**Task**: Containerize the Node.js API for production.

**Instructions**:

1. Create `Dockerfile` in api directory
2. Use node:18-alpine as base image
3. Set working directory to `/app`
4. Copy package files and run `npm ci` for clean install
5. Copy source code
6. Run TypeScript build command to compile to JavaScript
7. Expose port 5000
8. Set CMD to start the compiled application

**Validation Test**:

- Build the Docker image: `docker build -t waste-api .`
- Verify build completes successfully
- Run container with environment variables: `docker run -p 5000:5000 -e MONGODB_URI=mongodb://host.docker.internal:27017/waste-management waste-api`
- Verify API starts and connects to database
- Test `/api/health` endpoint returns 200
- Verify `/api/wastes` endpoint returns data

---

### Step 4.4: Create Complete Docker Compose Configuration

**Task**: Orchestrate all services together with Docker Compose.

**Instructions**:

1. Create `docker-compose.yml` in project root
2. Define four services: mongodb, api, frontend, nginx
3. MongoDB service:
   - Use mongo:7 image
   - Expose port 27017
   - Configure persistent volume
4. API service:
   - Build from ./api context
   - Set environment variables
   - Depend on mongodb
5. Frontend service:
   - Build from ./frontend context
   - Depend on api
6. Nginx service (optional, for production-like setup):
   - Use nginx:alpine
   - Proxy both frontend and api
7. Create shared network for all services

**Validation Test**:

- Run `docker-compose up --build`
- Verify all four containers start successfully
- Check logs for each service to confirm no errors
- Access frontend at `http://localhost:3000`
- Verify frontend can communicate with backend
- Verify data persists after stopping and restarting
- Run `docker-compose down` to clean up

---

### Step 4.5: Create Development Docker Compose

**Task**: Set up a developer-friendly Docker Compose with hot reload.

**Instructions**:

1. Create `docker-compose.dev.yml` file
2. Configure similar services to production compose
3. For API service:
   - Mount ./api directory as volume (exclude node_modules)
   - Override command to use `npm run dev` with file watching
4. For frontend service:
   - Mount ./frontend directory as volume (exclude node_modules)
   - Override command to use `npm run dev`
   - Expose Vite's port directly
5. Remove production nginx service (not needed in dev)

**Validation Test**:

- Run `docker-compose -f docker-compose.dev.yml up`
- Verify all containers start
- Edit a file in api/src and verify server restarts automatically
- Edit a file in frontend/src and verify browser hot-reloads
- Verify changes appear without rebuilding containers
- Check that node_modules are not overwritten by volume mount

---

### Step 4.6: Create Startup Scripts for Development

**Task**: Build automation scripts to simplify development workflow.

**Instructions**:

1. Create PowerShell script `scripts/start-dev.ps1`:
   - Check if Docker is running
   - Create .env files from .env.example if missing
   - Start docker-compose with dev configuration
   - Display URLs for all services
2. Create Bash script `scripts/start-dev.sh` with same functionality
3. Create `install-all` scripts (PS1 and SH) that run npm install in both api and frontend
4. Create `start-local` scripts that start MongoDB via Docker and run npm run dev locally
5. Make all .sh scripts executable

**Validation Test**:

- Run `.\start-dev.ps1` on Windows (or ./start-dev.sh on Mac/Linux)
- Verify Docker containers start
- Verify URLs are displayed in console
- Access each URL and verify services work
- Run `.\install-all.ps1` to verify dependencies install
- Run `.\start-local.ps1` to verify local development setup

---

### Step 4.7: Configure GitHub Actions CI Pipeline

**Task**: Set up automated testing and building on code changes.

**Instructions**:

1. Create `.github/workflows` directory
2. Create `ci-cd.yml` workflow file
3. Define jobs that run on push and pull requests to main/develop:
   - `test-frontend`: Install deps, run linter, run tests, build
   - `test-api`: Start MongoDB service, install deps, run linter, run tests, build
   - `build-docker`: Build Docker images (only on main branch)
   - `security-scan`: Run Trivy vulnerability scanner
4. Configure Node.js version matrix if needed
5. Add caching for node_modules to speed up builds

**Validation Test**:

- Commit and push changes to trigger workflow
- Go to GitHub Actions tab in repository
- Verify workflow runs automatically
- Verify all jobs complete successfully (green checkmarks)
- Introduce a lint error and verify workflow fails
- Fix error and verify workflow passes again

---

### Step 4.8: Set Up Environment Configuration Files

**Task**: Create example environment files for all environments.

**Instructions**:

1. In api directory, create `.env.example`:
   - PORT=5000
   - NODE_ENV=development
   - MONGODB_URI=mongodb://localhost:27017/waste-management
   - JWT_SECRET=your-secret-key-change-in-production
2. In frontend directory, create `.env.example`:
   - VITE_API_URL=<http://localhost:5000/api>
3. Add instructions to README for copying these files
4. Ensure .env files are in .gitignore

**Validation Test**:

- Delete any existing .env files
- Copy .env.example to .env in both directories
- Start the application
- Verify services start correctly with default configuration
- Modify an environment variable and verify change takes effect
- Verify .env files are not tracked by git (run `git status`)

---

## Phase 5: Testing and Quality Assurance

### Step 5.1: Create Postman Collection

**Task**: Build a comprehensive API testing collection for container tracking.

**Instructions**:

1. Create `postman` directory in project root
2. Create a Postman collection JSON file
3. Add requests organized by resource:
   - **Health**: Health check endpoint
   - **Auth**: Register, Login, Refresh Token, Logout
   - **Recycling Centers**: Get all, Get by ID, Create, Update, Delete
   - **Container Types**: Get all, Create, Update, Delete
   - **Containers**: Get by center, Get by ID, Create, Update, Declare Status, Get history, Set maintenance
   - **Dashboard**: Get stats, Get alerts, Get rotation metrics, Get recent activity
4. Add collection-level variables for `base_url`, `token`, `centerId`, `containerId`
5. Add pre-request scripts to auto-set auth token
6. Create environment files for development, staging, and production
7. Add example responses for each request

**Validation Test**:

- Import collection into Postman
- Import development environment
- Run the health check request and verify success
- Run "Register" and "Login" requests in sequence
- Verify token is auto-saved to variable
- Run "Get all centers" and verify auth token is sent
- Run all requests in sequence (Auth → Centers → Types → Containers → Dashboard)
- Verify all requests return expected results
- Test error scenarios (invalid token, missing fields)

---

### Step 5.2: Write Integration Tests for API

**Task**: Create automated tests for API endpoints.

**Instructions**:

1. Install Jest and Supertest as dev dependencies
2. Create `src/__tests__` directory
3. Write test suite for authentication:
   - Test user registration with valid data
   - Test registration with duplicate email returns 409
   - Test login with correct credentials returns tokens
   - Test login with wrong password returns 401
   - Test protected endpoints without token return 401
4. Write test suite for container operations:
   - Test creating a container
   - Test getting containers by center
   - Test declaring status (empty → full)
   - Test throttling (rapid declarations return 409)
   - Test maintenance mode restrictions
5. Write test suite for dashboard:
   - Test getting stats returns correct calculations
   - Test alerts show full containers
6. Configure Jest to run with TypeScript
7. Add test script to package.json
8. Set up test database separate from development

**Validation Test**:

- Run `npm test` in api directory
- Verify all tests pass
- Check code coverage report (aim for > 70%)
- Intentionally break a test and verify it fails
- Verify test output is clear and readable
- Run tests in CI pipeline and verify they execute
- Verify tests clean up data after execution

---

### Step 5.3: Add Frontend Component Tests

**Task**: Write tests for React components.

**Instructions**:

1. Install Vitest and React Testing Library
2. Create test files colocated with components
3. Write tests for Dashboard component:
   - Test that component renders without crashing
   - Test that center selector is displayed
   - Test that stats cards are displayed
   - Mock API calls for center data
4. Write tests for ContainerList component:
   - Test loading state shows spinner
   - Test empty state shows message
   - Test populated state shows container cards
   - Test status badges show correct colors
   - Test filtering by type and status works
5. Write tests for status declaration:
   - Test confirmation dialog appears
   - Test successful declaration updates UI
   - Test throttle error shows appropriate message
6. Write tests for authentication:
   - Test login form submission
   - Test redirect after login
   - Test protected route redirect when not authenticated
7. Configure Vitest in vite.config.ts

**Validation Test**:

- Run `npm test` in frontend directory
- Verify all tests pass
- Check that components render correctly
- Verify mocked API calls work as expected
- Run tests in watch mode and verify they re-run on changes
- Check coverage report shows good coverage percentage (> 60%)
- Verify tests don't make real API calls

---

### Step 5.4: Perform End-to-End Manual Testing

**Task**: Execute comprehensive manual testing checklist for container tracking.

**Instructions**:

1. Start the complete application (all services)
2. Test the following authentication workflow:
   - Register a new user account
   - Verify email validation works
   - Login with created account
   - Verify redirect to dashboard
   - Verify logout works
3. Test container tracking workflow:
   - Select a recycling center from dropdown
   - Verify stats cards show correct counts
   - Navigate to container list
   - View containers and verify status badges
   - Declare a container as "full"
   - Verify success notification
   - Try declaring same container again immediately
   - Verify throttle error message
   - Wait 60 seconds and declare again successfully
4. Test real-time updates:
   - Open app in two browser windows
   - In window 1, declare a status
   - Verify window 2 updates automatically
5. Test container history:
   - Click on a container to view history
   - Verify timeline shows all status events
   - Verify user information is displayed
6. Test manager dashboard (if logged in as manager):
   - Navigate to manager dashboard
   - Verify statistics are accurate
   - Check alerts tab shows full containers
   - Create a new container type
   - Create a container using the new type
   - Set a container to maintenance mode
7. Test responsive design:
   - Test on mobile viewport
   - Verify all pages are usable
   - Verify touch interactions work
8. Test error scenarios:
   - Navigate to invalid URL and verify 404 page
   - Disconnect network and verify error handling
   - Test with slow network (throttle in DevTools)
9. Document any bugs found

**Validation Test**:

- Complete the entire workflow without errors
- Verify data persists across page refreshes
- Verify all CRUD operations work end-to-end
- Verify error messages are user-friendly in French
- Verify loading states appear appropriately
- Verify no console errors in browser DevTools
- Verify WebSocket connection is stable
- Verify authentication persists across sessions
- Verify role-based access control works

---

## Phase 6: Documentation and Finalization

### Step 6.1: Write Comprehensive README

**Task**: Create detailed documentation in the root README file.

**Instructions**:

1. Add project overview and description
2. Document the folder structure with brief explanations
3. Add prerequisites section (Node.js version, Docker, MongoDB)
4. Provide installation steps (both Docker and local)
5. Document available npm scripts for both frontend and api
6. Add troubleshooting section for common issues
7. Include links to additional documentation
8. Add technology stack section
9. Include screenshots or demo GIF (optional)

**Validation Test**:

- Give README to someone unfamiliar with the project
- Ask them to set up the project following only the README
- Verify they can successfully start the application
- Note any confusion points and clarify documentation
- Verify all links work
- Check that code blocks are properly formatted

---

### Step 6.2: Document API Endpoints

**Task**: Ensure API documentation is complete and accurate.

**Instructions**:

1. Verify Swagger documentation at `/api-docs` is complete
2. Ensure all endpoints have descriptions
3. Verify request body schemas are documented
4. Verify response schemas show correct structure
5. Add example request/response for each endpoint
6. Document query parameters with examples
7. Create an API README in the api directory

**Validation Test**:

- Access Swagger UI at <http://localhost:5000/api-docs>
- Read through each endpoint documentation
- Use "Try it out" feature on each endpoint
- Verify examples match actual API behavior
- Check that error responses are documented
- Verify schema definitions are accurate

---

### Step 6.3: Create Architecture Documentation

**Task**: Document the system architecture and design decisions.

**Instructions**:

1. Create `documentation/architecture.md` file
2. Document the three-tier architecture (frontend, backend, database)
3. Create or describe a system diagram showing component interactions
4. Document technology choices and rationale
5. Explain data flow from user action to database and back
6. Document API design patterns used (REST)
7. Describe database schema and relationships
8. Document any security considerations

**Validation Test**:

- Read through architecture documentation
- Verify technical terms are explained clearly
- Check that someone new to the project can understand the system
- Verify documentation matches actual implementation
- Update documentation if any discrepancies found
- Have a team member review for clarity

---

### Step 6.4: Add Contributing Guidelines

**Task**: Create guidelines for future contributors.

**Instructions**:

1. Create `CONTRIBUTING.md` file in project root
2. Document the Git workflow (branch naming, commit messages)
3. Provide code style guidelines
4. Explain how to run tests before submitting PR
5. Document PR process and review requirements
6. Add issue templates for bugs and features (optional)
7. Include code of conduct section
8. Explain how to set up development environment

**Validation Test**:

- Follow the contributing guide yourself to test it
- Verify all steps are clear and actionable
- Check that links to external resources work
- Ensure coding standards match linter configuration
- Test that a new contributor could follow the guide
- Get feedback from team members

---

### Step 6.5: Final Security and Performance Review

**Task**: Conduct final checks for security and performance.

**Instructions**:

1. Run security audit: `npm audit` in both frontend and api
2. Fix any high or critical vulnerabilities
3. Review all environment variables for sensitive data
4. Ensure .env files are in .gitignore
5. Verify CORS configuration is not too permissive
6. Check that API has rate limiting (if implemented)
7. Review database queries for N+1 problems
8. Test application performance with larger datasets
9. Verify Docker images don't contain unnecessary files
10. Check that production builds are optimized (minified, tree-shaken)

**Validation Test**:

- `npm audit` shows no critical vulnerabilities
- Search codebase for hardcoded secrets (find none)
- Verify `.env` is listed in `.gitignore`
- Test API with 1000+ records to check performance
- Measure frontend bundle size (should be reasonable)
- Check that source maps are not exposed in production
- Run Lighthouse audit on frontend (score > 80)

---

## Completion Checklist

Before considering the implementation complete, verify:

- [ ] All services start without errors (MongoDB, API with Socket.IO, Frontend, Redis)
- [ ] Database connections are stable
- [ ] Authentication system works (register, login, logout, token refresh)
- [ ] Role-based access control prevents unauthorized access
- [ ] Container CRUD operations work correctly for managers
- [ ] Status declaration works with proper validation
- [ ] Anti-spam throttling (60s) prevents rapid declarations
- [ ] Maintenance mode restrictions are enforced
- [ ] Real-time WebSocket updates work across multiple clients
- [ ] Frontend communicates with backend successfully
- [ ] Audit logs are created for all important actions
- [ ] Dashboard statistics show accurate data
- [ ] Alerts identify containers needing attention
- [ ] Container history timeline displays correctly
- [ ] Geolocation finds nearest center accurately
- [ ] Swagger documentation is accessible and accurate at `/api-docs`
- [ ] Postman collection covers all endpoints
- [ ] Docker Compose orchestrates all services
- [ ] CI/CD pipeline runs successfully
- [ ] Tests pass (both frontend and backend with > 60% coverage)
- [ ] README is comprehensive and accurate
- [ ] Environment configuration is properly documented
- [ ] No sensitive data (passwords, tokens) is committed to repository
- [ ] Application is responsive on mobile devices
- [ ] Error handling is implemented throughout with French messages
- [ ] Loading states provide good UX
- [ ] WebSocket connection indicator works correctly
- [ ] Redis throttling keys expire correctly

---

## Next Steps (Post-Implementation)

After completing this plan, consider these enhancements:

1. **Sensor Integration**: Connect IoT sensors to automatically detect fill levels
2. **Photo Evidence**: Allow users to upload photos when declaring status
3. **Push Notifications**: Send browser/mobile notifications for full containers
4. **Advanced Analytics**: Add trend analysis, predictions, seasonal patterns
5. **Route Optimization**: Calculate optimal collection routes for agents
6. **QR Code Scanning**: Generate QR codes for containers, scan to declare status
7. **Multi-language Support**: Add internationalization (French, English, etc.)
8. **Offline Mode**: Allow status declarations offline, sync when back online
9. **Reporting System**: Generate PDF reports for managers (monthly, quarterly)
10. **Container Maintenance Tracking**: Log maintenance history, schedule preventive maintenance
11. **Collection Scheduling**: Integrate with calendar for planned pickups
12. **Gamification**: Add points/badges for active users to encourage participation
13. **API Rate Limiting**: Implement sophisticated rate limiting beyond anti-spam
14. **Data Export**: Allow exporting data to CSV/Excel for analysis
15. **Advanced Permissions**: Fine-grained permissions per center, container type
16. **Mobile App**: Develop React Native app for iOS/Android
17. **Email Notifications**: Send emails for alerts, weekly summaries
18. **Container Groups**: Allow grouping containers (e.g., "Zone A", "Building 1")
19. **Historical Trends Dashboard**: Visualize fill patterns over time
20. **Third-party Integrations**: Integrate with waste management software, ERP systems

---

## Notes for AI Developers

- Each step should be implemented and tested before moving to the next
- If a step fails validation, debug and fix before proceeding
- Take note of any deviations from the plan (document why)
- Feel free to suggest improvements to the plan as issues are discovered
- Keep the README updated as implementation progresses
- Commit code frequently with clear, descriptive messages
- Run linter and formatter before each commit
- Ask for clarification if any step is ambiguous
- Prioritize working software over perfect code
- Remember: Test as you go, don't leave testing for the end
- Pay special attention to security: authentication, authorization, input validation
- Ensure real-time features (WebSocket) are stable and handle reconnections
- The anti-spam/throttling mechanism is critical – test thoroughly
- Consider edge cases: maintenance mode, concurrent status declarations, network issues
- French is the primary language for UI text – use appropriate translations
- Focus on user experience: clear error messages, loading states, responsive design
