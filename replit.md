# GeeKTunes - Music Artist Platform

## Overview

GeeKTunes is a modern web application for discovering and exploring music artists with a focus on geek culture and gaming-inspired music. The platform features a clean, responsive interface for browsing artists by categories, playing music samples, and managing artist profiles.

## System Architecture

The application follows a full-stack TypeScript architecture with a clear separation between client and server:

- **Frontend**: React with TypeScript, styled using Tailwind CSS and shadcn/ui components
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Build Tool**: Vite for fast development and optimized production builds
- **Deployment**: Configured for Replit with autoscale deployment

## Key Components

### Frontend Architecture
- **React Router**: Using Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Theme System**: Dark/light mode support with persistent storage
- **Admin Panel**: Professional administrative interface for content management
- **Authentication**: Replit Auth integration with role-based permissions

### Backend Architecture
- **API Design**: RESTful endpoints for artist management and discovery
- **Database Layer**: Drizzle ORM with PostgreSQL for data persistence
- **Storage Interface**: Abstracted storage layer with full CRUD operations
- **Admin API**: Protected admin endpoints for content management with role validation
- **Authentication**: Secure Replit Auth integration with session management
- **Development Server**: Vite integration for hot module replacement in development

### Database Schema
The application uses several main entities:
- **Users**: User authentication with Replit Auth integration and admin role permissions
- **Artists**: Comprehensive artist profiles including name, avatar, description, roles, social links, and music URLs
- **Projects**: Musical projects with cover images, descriptions, video previews, and collaboration details
- **Likes**: User interaction system for favoriting artists
- **Sessions**: Secure session management for authentication

## Data Flow

1. **Client Requests**: React components use TanStack Query to fetch data from API endpoints
2. **API Layer**: Express routes handle HTTP requests and validate input
3. **Storage Layer**: Abstracted storage interface allows switching between in-memory and database implementations
4. **Database Operations**: Drizzle ORM provides type-safe database queries to PostgreSQL

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration tools
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library for enhanced user experience
- **@radix-ui/***: Headless UI primitives for accessibility

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:
- **Development**: `npm run dev` starts both client and server with hot reloading
- **Production Build**: `npm run build` creates optimized bundles for both client and server
- **Database Migrations**: `npm run db:push` applies schema changes to PostgreSQL
- **Port Configuration**: Server runs on port 5000, mapped to external port 80
- **Auto-scaling**: Configured for automatic scaling based on demand

The build process separates client-side assets (served statically) from the server bundle, optimizing for performance and deployment efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 21, 2025**: Enhanced project filters with icons and smooth animations
- **June 21, 2025**: Added previewVideoUrl field for video previews in project cards
- **June 21, 2025**: Implemented multi-platform video support (YouTube, Vimeo, Instagram, TikTok, Twitter/X, Facebook)
- **June 21, 2025**: Fixed Instagram embed issues - now opens in new tab
- **June 21, 2025**: Improved video controls - YouTube/Vimeo with audio, MP4 files without controls
- **June 21, 2025**: Added auto-hide functionality when video preview ends
- **June 21, 2025**: Created professional admin panel for managing artists and projects
- **June 21, 2025**: Added user admin permissions system with role-based access control
- **June 21, 2025**: Fixed like button authentication issues with improved error handling
- **June 21, 2025**: Fixed admin panel tab button layout to prevent text overlapping
- **June 21, 2025**: Enhanced notification system with beautiful visual design and animations
- **June 21, 2025**: Fixed notification creation and database integration issues
- **June 21, 2025**: Improved notification bell with hover animations and gradient badges

## User Preferences

- Communication: Simple, everyday language (Portuguese)
- Video functionality: Supports hover/click preview with smooth transitions
- Instagram/Twitter links: Open in new tab instead of embedding
- Direct video files: No controls, auto-loop, return to cover when ended

## Changelog

Changelog:
- June 18, 2025. Initial setup
- June 21, 2025. Major video preview system implementation