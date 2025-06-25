# GeeKTunes - Music Artist Platform

## Overview

chaos squadis a modern web application for discovering and exploring music artists with a focus on geek culture and gaming-inspired music. The platform features a clean, responsive interface for browsing artists by categories, playing music samples, and managing artist profiles.

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
- **June 21, 2025**: Fixed admin authentication bug - status preserved between sessions
- **June 21, 2025**: Added 5 new animated themes: Matrix (digital rain), Cosmos (starfield), Ocean (waves), Fire (flames), Aurora (northern lights)
- **June 21, 2025**: Fixed Sparkles import error in admin panel
- **June 21, 2025**: Fixed notification deletion bug - now permanently removes notifications from database
- **June 22, 2025**: Enhanced notification system with expandable messages and "read more/less" functionality
- **June 22, 2025**: Added "Sistema" notification type with purple icon in admin panel
- **June 22, 2025**: Added smooth animations to notification expansion with Framer Motion
- **June 22, 2025**: Created detailed artist profile page with stats, projects, and social links
- **June 22, 2025**: Added profile button to artist cards for easy navigation
- **June 22, 2025**: Enhanced artist profile with Twitter/Discord-style banner design
- **June 22, 2025**: Redesigned statistics cards with animated icons and improved visual hierarchy
- **June 22, 2025**: Added professional chat system with real-time WebSocket communication
- **June 22, 2025**: Created chat page with message history, user avatars, and admin badges
- **June 22, 2025**: Integrated chat button in main navigation with gradient styling
- **June 22, 2025**: Moved chat button from tab filters to header navigation
- **June 22, 2025**: Implemented @mentions system with user autocomplete and highlight
- **June 22, 2025**: Added public users endpoint for mention functionality
- **June 22, 2025**: Fixed chat input blocking issue and improved mentions dropdown
- **June 22, 2025**: Enhanced chat to show artist names and avatars when users have artist profiles
- **June 22, 2025**: Added artist badges in chat for users with linked artist accounts
- **June 22, 2025**: Fixed console unhandled rejection warnings
- **June 22, 2025**: Completely redesigned chat interface with modern gradient design
- **June 22, 2025**: Added smooth animations, hover effects, and improved visual hierarchy
- **June 22, 2025**: Enhanced message bubbles with gradient backgrounds and better spacing
- **June 22, 2025**: Improved mentions dropdown with better styling and animations
- **June 22, 2025**: Reduced message spacing for more fluid conversation flow
- **June 22, 2025**: Fixed chat input text visibility issue - text now always visible
- **June 22, 2025**: Added touch support for mention autocomplete on mobile devices
- **June 22, 2025**: Implemented real-time typing indicators with WebSocket
- **June 22, 2025**: Added animated "user is typing" with multiple users support
- **June 23, 2025**: Fixed chat typing indicator position and improved animations with gradient effects
- **June 23, 2025**: Resolved @ mention dropdown z-index conflicts - now displays above all chat elements
- **June 23, 2025**: Implemented mention notification system - users receive notifications when mentioned in chat
- **June 23, 2025**: Added click-to-navigate functionality - clicking mention notifications leads to chat page
- **June 23, 2025**: Created floating notification system - real-time toast notifications appear when users receive new notifications
- **June 23, 2025**: Added auto-hide timer and smooth animations for floating notifications with progress bar
- **June 23, 2025**: Integrated floating notifications across all pages with click-to-navigate functionality
- **June 23, 2025**: Fixed notification system creation and enhanced admin panel with target selection
- **June 23, 2025**: Added notification targeting options: all users, artists only, or specific user
- **June 23, 2025**: Updated database schema to support notification targeting with targetType field
- **June 23, 2025**: Corrected getUserNotifications to properly filter notifications by target type
- **June 23, 2025**: Fixed mention notifications to only target specific mentioned users instead of all users
- **June 23, 2025**: Fixed menu button visibility - now always visible on all screen sizes for better navigation access
- **June 23, 2025**: Fixed menu button position - moved before user section to ensure visibility for admin users
- **June 23, 2025**: Fixed header layout overflow - reduced button sizes and spacing to prevent elements from going off-screen
- **June 23, 2025**: Added "Meu Perfil" option to mobile navigation menu for easy access to user profile page
- **June 24, 2025**: Completely redesigned landing page with advanced animations and interactive elements
- **June 24, 2025**: Added mouse-following background effects and parallax scrolling
- **June 24, 2025**: Enhanced feature cards with 3D hover effects, shimmer animations, and particle systems
- **June 24, 2025**: Implemented floating icon animations, sparkle effects, and dynamic color gradients
- **June 24, 2025**: Added interactive statistics section with rotating icons and hover animations
- **June 24, 2025**: Optimized landing page performance by reducing complex animations and particle count
- **June 24, 2025**: Simplified hover effects and removed heavy CSS animations to improve responsiveness
- **June 24, 2025**: Increased floating particles from 6 to 15 with enhanced variety and animations
- **June 24, 2025**: Implemented context menu system for chat messages with reply, copy, and delete options
- **June 24, 2025**: Added long-press and right-click support for message interactions
- **June 24, 2025**: Created reply preview system with visual indicators and cancel functionality
- **June 25, 2025**: Migrated from Replit Auth to simple username/password authentication system
- **June 25, 2025**: Implemented complete login/register page with form validation
- **June 25, 2025**: Fixed logout button to use new authentication system with mutations
- **June 25, 2025**: Prepared project for Vercel deployment with serverless functions
- **June 25, 2025**: Created vercel.json configuration and API directory structure
- **June 25, 2025**: Updated all authentication routes to use standard user.id instead of Replit claims
- **June 25, 2025**: Created deployment documentation and environment variable examples

## User Preferences

- Communication: Simple, everyday language (Portuguese)
- Video functionality: Supports hover/click preview with smooth transitions
- Instagram/Twitter links: Open in new tab instead of embedding
- Direct video files: No controls, auto-loop, return to cover when ended
- Deployment: Vercel instead of Replit for production hosting

## Changelog

Changelog:
- June 18, 2025. Initial setup
- June 21, 2025. Major video preview system implementation