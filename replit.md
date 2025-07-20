# Inspire - Personal Growth & Reflection App

## Overview

Inspire is a full-stack web application that provides users with personalized daily inspiration through curated quotes, philosophical teachings, and journaling capabilities. The app helps users discover wisdom from historical figures and philosophical traditions while maintaining a personal journal for reflection and growth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **API Pattern**: RESTful API with conventional HTTP methods

### Design System
- **Color Palette**: Sage green primary, cream background, warm gray text
- **Typography**: System fonts with serif accents for character names
- **Components**: Mobile-first responsive design
- **Theme**: Light mode with CSS custom properties

## Key Components

### Authentication & User Management
- **Replit Auth Integration**: Handles OAuth flow and user sessions
- **User Profiles**: Stores user preferences, setup completion status
- **Session Storage**: PostgreSQL-based session persistence
- **Protected Routes**: Middleware-based route protection

### Content Management
- **Characters**: Historical figures and thought leaders (Marcus Aurelius, Buddha, Socrates, etc.)
- **Philosophies**: Philosophical traditions and schools of thought
- **Quotes**: Inspirational content linked to characters and philosophies
- **User Preferences**: Character and philosophy selections during onboarding

### Core Features
- **Daily Quotes**: Personalized quote delivery based on user preferences
- **Journal**: Personal reflection and note-taking with quote integration
- **Setup Flow**: Multi-step onboarding for character and philosophy selection
- **Reminders**: Quote pinning and reminder system

### Data Models
- **Users**: Profile information, setup status, preferences
- **Characters**: Name, description, category, biography
- **Philosophies**: Name, description
- **User Relationships**: Selected characters and philosophies
- **Journal Entries**: User reflections with optional quote associations
- **Reminders**: Pinned quotes with scheduling information

## Data Flow

1. **Authentication Flow**: User logs in via Replit Auth → Session established → User data loaded
2. **Onboarding Flow**: New users select characters/philosophies → Preferences saved → Setup completed
3. **Daily Experience**: User visits app → Daily quote fetched based on preferences → Journal entries displayed
4. **Content Creation**: User writes journal entry → Optional quote suggestions → Entry saved with associations
5. **Reminder System**: User pins quotes → Reminders created → Periodic notifications (planned)

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for Replit
- **drizzle-orm**: Type-safe database queries and migrations
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **@radix-ui/***: Headless UI component primitives

### Development Tools
- **Vite**: Build tool with React plugin and development server
- **TypeScript**: Type checking and development experience
- **Tailwind CSS**: Utility-first styling framework
- **ESLint/Prettier**: Code quality and formatting (configured via Replit)

### Authentication
- **openid-client**: OAuth/OpenID Connect client
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Replit Integration**: Native development environment with hot reload
- **Database**: Neon PostgreSQL instance provisioned via Replit
- **Environment Variables**: Database URL, session secrets, OAuth configuration

### Build Process
- **Client Build**: Vite bundles React app to `dist/public`
- **Server Build**: esbuild bundles Express server to `dist/index.js`
- **Database Migration**: Drizzle kit handles schema changes

### Production Considerations
- **Static Assets**: Served via Express static middleware in production
- **Database Connection**: Connection pooling with Neon serverless driver
- **Session Security**: Secure cookies, HTTPS enforcement
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Performance Optimizations
- **Query Caching**: TanStack Query provides client-side caching
- **Database Indexes**: Proper indexing on frequently queried fields
- **Bundle Splitting**: Vite handles automatic code splitting
- **Asset Optimization**: Vite optimizes images and other assets

The application follows a traditional MVC pattern with clear separation between client and server, using modern tooling for developer experience while maintaining production readiness through proper error handling, authentication, and database management.