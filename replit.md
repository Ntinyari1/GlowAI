# GlowAI - Personalized Skincare App

## Overview

GlowAI is a full-stack web application that provides personalized skincare recommendations through AI-powered insights. The application combines modern web technologies with machine learning to deliver customized skincare tips, product reviews, and routine recommendations based on individual user profiles.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **AI Integration**: Google GenAI (Gemini) for content generation
- **Session Management**: Express sessions with PostgreSQL store

### Development Setup
- **Monorepo Structure**: Client and server code in separate directories with shared types
- **Hot Reload**: Vite middleware for development server
- **Path Aliases**: TypeScript path mapping for clean imports
- **Code Quality**: ESLint and TypeScript strict mode

## Key Components

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following main tables:
- **Users**: Profile information including skin type, concerns, age, and goals
- **Tips**: AI-generated skincare advice categorized by time of day and skin type
- **Products**: Detailed product information with ratings, pros/cons, and recommendations
- **Routines**: User-created skincare routines with ordered steps
- **Favorites**: User bookmarks for tips and products
- **User Activity**: Tracking for engagement and personalization

### AI-Powered Features
- **Tip Generation**: Personalized skincare advice based on user profile and time of day
- **Product Analysis**: AI-generated product reviews with pros, cons, and suitability
- **Routine Recommendations**: Custom morning and evening skincare routines

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: Radix UI primitives ensure WCAG compliance
- **Theme System**: Custom color palette with CSS variables for easy theming
- **Component Library**: Reusable UI components following design system patterns

## Data Flow

1. **User Onboarding**: Skin questionnaire captures user profile data
2. **Personalization**: AI generates content based on user skin type and concerns
3. **Content Delivery**: Tips and recommendations served through REST API
4. **User Interaction**: Favorites, likes, and routine creation tracked for further personalization
5. **Real-time Updates**: TanStack Query manages cache invalidation and optimistic updates

## External Dependencies

### AI Services
- **Google GenAI**: Primary AI service for content generation using Gemini models
- **Environment Variables**: API keys managed through environment configuration

### Database
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle Kit**: Database migrations and schema management

### UI Libraries
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: Icon library with consistent styling
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

### Production Build
- **Client**: Vite builds optimized static assets to `dist/public`
- **Server**: ESBuild bundles Node.js server to `dist/index.js`
- **Assets**: Static files served from Express with fallback to SPA routing

### Hosting Platform
- **Replit**: Configured for autoscale deployment
- **Port Configuration**: Server runs on port 5000, mapped to external port 80
- **Environment**: Production and development configurations

### Database Management
- **Migrations**: Drizzle Kit handles schema changes
- **Connection**: Environment-based DATABASE_URL configuration
- **Pooling**: Neon serverless handles connection management automatically

## Changelog
- June 27, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.