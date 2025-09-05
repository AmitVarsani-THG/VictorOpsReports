# VictorOps Reporter

## Overview

VictorOps Reporter is a full-stack web application that integrates with the VictorOps (now PagerDuty) API to generate comprehensive out-of-hours callout reports. The application provides analytics and insights into incident response patterns, including response times, callout frequency, and team performance metrics. Users can configure their VictorOps API credentials, filter reports by team or individual users, and view detailed incident information with interactive modals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React 18** and **TypeScript**, utilizing a modern component-based architecture:

- **Routing**: Uses `wouter` for lightweight client-side routing
- **State Management**: Leverages React Query (`@tanstack/react-query`) for server state management and caching
- **UI Framework**: Implements shadcn/ui components built on top of Radix UI primitives for accessible, customizable components
- **Styling**: Uses Tailwind CSS with CSS custom properties for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

The architecture follows a clean separation of concerns with dedicated directories for components, pages, hooks, and utilities. The UI is designed to be fully responsive and accessible.

### Backend Architecture
The backend is an **Express.js** server written in TypeScript:

- **API Integration**: Makes HTTP requests to the VictorOps API using Axios for fetching teams, users, and incident data
- **Data Processing**: Implements business logic for calculating out-of-hours periods, response times, and report metrics
- **Storage Layer**: Uses an in-memory storage implementation with an interface design that allows for easy database integration later
- **Caching**: Implements report caching to improve performance for repeated queries
- **Error Handling**: Centralized error handling with proper HTTP status codes and user-friendly error messages

### Database Design
Currently uses **in-memory storage** with a well-defined interface (`IStorage`) that abstracts data operations:

- **API Configuration**: Stores VictorOps API credentials
- **Cached Data**: Teams and users from VictorOps API
- **Report Cache**: Generated report summaries with configurable keys

The storage interface is designed to easily accommodate a PostgreSQL database with Drizzle ORM integration, as evidenced by the Drizzle configuration files.

### Development and Build Pipeline
- **Development Server**: Uses Vite dev server with HMR for fast development
- **Production Build**: Bundles frontend with Vite and backend with esbuild
- **TypeScript**: Strict type checking across the entire codebase
- **Path Aliases**: Configured for clean imports (`@/`, `@shared/`)

### Business Logic
The application implements sophisticated business rules for:

- **Out-of-Hours Detection**: Automatically identifies incidents occurring outside business hours (weekends and weekday evenings)
- **Response Time Calculation**: Measures time between incident start and acknowledgment
- **Report Generation**: Aggregates data by team or individual user with filtering capabilities
- **Data Validation**: Uses Zod schemas for runtime type validation and API contract enforcement

## External Dependencies

### Core Framework Dependencies
- **React 18** with TypeScript for the frontend framework
- **Express.js** for the backend API server
- **Vite** as the build tool and development server

### UI and Styling
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling
- **Lucide React** for consistent iconography

### API and Data Management
- **VictorOps (PagerDuty) API** for incident, team, and user data
- **Axios** for HTTP client functionality
- **React Query** for server state management and caching
- **Zod** for schema validation and type safety

### Database (Prepared)
- **Drizzle ORM** configured for PostgreSQL integration
- **@neondatabase/serverless** for serverless PostgreSQL connections
- Database configuration ready but currently using in-memory storage

### Development Tools
- **TypeScript** for static type checking
- **wouter** for lightweight client-side routing
- **PostCSS** and **Autoprefixer** for CSS processing
- **@replit/vite-plugin-runtime-error-modal** for enhanced development experience

The application is architected to be easily deployable and scalable, with clear separation between development and production configurations.