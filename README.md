# Oda Bultum University Dormitory Management System (DMS)

A comprehensive Dormitory Management System built for Oda Bultum University (OBU) using React, TypeScript, and Vite. This frontend application provides a modern interface for managing all aspects of university dormitory operations including student accommodations, room assignments, maintenance requests, and inventory management.

## 🎯 Project Overview

This system is derived from the OBU-DMS SRS (Version 1.0, January 2026) and focuses specifically on frontend functionality, user interactions, and API integration. The system serves multiple user roles with role-based access control and provides a responsive, accessible interface for both desktop and mobile users.

## 👥 User Roles

- **Student**: View profile, room assignments, submit maintenance requests, request room changes
- **Dorm Administrator**: Manage rooms, assign rooms, approve/reject requests, manage students
- **Maintenance Staff**: View and update maintenance requests, track task assignments
- **Management**: Access reports, statistics, and overview dashboards
- **System Admin**: User management, system configuration, audit logs

## 🚀 Core Modules

### 🔐 Authentication Module
- Login with username/password
- Forgot password functionality with email reset
- Session timeout management (30 minutes inactivity)
- Token-based authentication

### 👤 Student Module
- View and update student profiles
- Search and filter students (admin functionality)
- View current room assignments
- Personal dashboard

### 🏠 Room Management Module
- View rooms with filtering by building and floor
- Check room availability status
- Manual room assignment (admin only)
- Room details and occupancy information

### 🔄 Room Change Module
- Submit room change requests (students)
- Approve/reject room change requests (admin)
- Track request status and history
- Notification system for status updates

### 🔧 Maintenance Module
- Submit maintenance requests
- Track request status and progress
- Admin task assignment to maintenance staff
- Staff status updates and completion tracking

### 📦 Inventory Management Module
- Track furniture inventory
- Manage linen supplies
- Key tracking and assignment
- Inventory reports and alerts

### 📊 Reporting Module
- Occupancy reports and statistics
- Student directory generation
- System performance analytics
- Export functionality for reports

### 👥 User Management Module
- Create and manage user accounts
- Role-based access control
- View system activity logs
- User permission management

### 🔔 Notification Module
- System notifications and alerts
- Administrative announcements
- Real-time updates for requests
- Notification history and preferences

## 🎨 UI/UX Features

### Responsive Design
- Mobile-friendly interface
- Desktop-optimized layouts
- Cross-browser compatibility
- Adaptive components

### Role-Based Dashboards
- **Student Dashboard**: Personal information, room details, quick actions
- **Admin Dashboard**: System overview, pending requests, key metrics
- **Maintenance Dashboard**: Assigned tasks, request queue, status updates
- **Management Dashboard**: Analytics, reports, system health

### Accessibility Features
- Multi-language support (English, Amharic, Afan Oromo)
- High contrast mode support
- Keyboard navigation optimization
- Screen reader compatibility

### UI Components
- Paginated data tables
- Form validation and error handling
- Advanced search and filtering
- Notification panels and toasts
- Interactive charts and graphs

## 🛠️ Technology Stack

- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Framework**: shadcn/ui with Radix UI components
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM 6.30.1
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Testing**: Vitest with React Testing Library
- **E2E Testing**: Playwright
- **Linting**: ESLint with TypeScript support

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or bun package manager

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd oda-bultum-dms
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The application will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
# or
yarn build
# or
bun build
```

### Preview Production Build

```bash
npm run preview
# or
yarn preview
# or
bun preview
```

## 🧪 Testing

### Unit Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### E2E Tests

```bash
# Run Playwright tests
npx playwright test
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

## 📁 Project Structure

```
oda-bultum-dms/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ui/             # shadcn/ui components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── test/               # Test files
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── docs/                   # Documentation
└── tests/                  # Test configurations
```

## 🌐 Application Routes

- `/` - Landing page
- `/login` - User authentication
- `/dashboard` - Main dashboard
- `/rooms` - Room management
- `/students` - Student management
- `/maintenance` - Maintenance tracking
- `/room-changes` - Room change requests
- `/inventory` - Inventory management
- `/reports` - Reports and analytics
- `/notifications` - Notification center
- `/users` - User management
- `/audit-logs` - Activity logs
- `/profile` - User profile
- `/settings` - Application settings

## 🎨 Customization

### Theme Configuration

The application supports light and dark themes with system preference detection. Theme settings are managed through the `ThemeProvider` component.

### Multi-language Support

The system is designed to support multiple languages:
- English (default)
- Amharic
- Afan Oromo

Language files and configurations can be found in the `src/lib/i18n/` directory.

### Component Customization

UI components are built with shadcn/ui and can be customized in the `src/components/ui/` directory. All components follow accessibility guidelines and can be themed according to institutional requirements.

## � Performance Requirements

- **Page Load Time**: < 3 seconds
- **Search Response**: < 2 seconds
- **Concurrent Users**: Optimized for high concurrent usage
- **Mobile Performance**: Optimized for mobile networks

## 🔒 Security Features

- Token-based authentication with JWT
- Role-based UI rendering and access control
- Client-side input validation and sanitization
- Session timeout and automatic logout (30 minutes)
- Secure API communication

## 🔌 API Integration

The frontend is designed to integrate with a RESTful API. Key API endpoints include:

- Authentication: `/auth/*`
- Students: `/students/*`
- Rooms: `/rooms/*`
- Maintenance: `/maintenance/*`
- Inventory: `/inventory/*`
- Reports: `/reports/*`
- Notifications: `/notifications/*`

For detailed API specifications, refer to the API documentation.

## � Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Oda Bultum DMS
VITE_SESSION_TIMEOUT=1800000
VITE_DEFAULT_LANGUAGE=en
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📚 Documentation

- **SRS Document**: Derived from OBU Dormitory Management System SRS v1.0 (January 2026)
- **API Documentation**: Available in the `/docs` directory
- **Component Documentation**: Storybook setup available for component exploration

## 🆘 Support

For support and questions:
- Open an issue in the repository
- Contact the development team
- Refer to the user manual in the `/docs` directory

---

**Built with ❤️ for Oda Bultum University**
