# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build client and server for production
npm run start        # Run production server
npm run db:push      # Push database schema changes via Drizzle
npm run check        # Run TypeScript type checking
```

## Architecture Overview

This is a full-stack TypeScript application for coordinating dump runs and waste management pickups.

### Tech Stack
- **Backend**: Express.js with WebSocket support, Passport authentication, Drizzle ORM
- **Frontend**: React 18 + Vite, TailwindCSS, shadcn/ui components, React Query, Wouter routing
- **Database**: PostgreSQL schema (currently using in-memory storage)
- **Real-time**: WebSocket server for chat functionality

### Key Patterns

**Authentication**: Session-based with Passport local strategy. Protected routes use the auth middleware. Demo login available for testing.

**API Structure**: REST endpoints in `server/routes.ts` follow pattern `/api/[resource]`. WebSocket connections handled separately for chat.

**State Management**: React Query for server state, local React hooks for UI state. Real-time updates via WebSocket.

**Database Schema**: Defined in `shared/schema.ts` using Drizzle ORM. Main entities: users, dumpSites, dumpRuns, pickupRequests.

**Component Structure**: UI components from shadcn/ui in `client/src/components/ui/`. Feature components use these primitives.

### Important Files
- `server/index.ts` - Main server setup with WebSocket integration
- `server/routes.ts` - All API endpoints
- `server/auth.ts` - Authentication logic
- `shared/schema.ts` - Database schema shared between client/server
- `client/src/hooks/use-auth.tsx` - Auth context and hooks
- `client/src/lib/queryClient.ts` - React Query configuration

### Current Limitations
- Using in-memory storage (PostgreSQL integration ready but not active)
- No email/SMS notifications implemented
- Payment integration prepared in schema but not implemented
- Geolocation for "nearby" features not implemented