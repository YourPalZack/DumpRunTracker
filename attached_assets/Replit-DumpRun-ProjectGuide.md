
# Replit Project Guide: Dump Run App

## Project Title
Community-Powered Junk Removal Platform

## Overview
A mobile and web application that enables users to coordinate shared dump runs, request junk pickups, and subscribe to weekly collection services. Users can save money by splitting dump fees and offload junk even without owning a truck.

## Features
- Create or join a dump run
- Approve/reject participants
- Real-time chat during active dump runs
- Split payments based on item size
- Pickup on demand with configurable pricing
- Weekly scheduled pickups (manual and auto-renew)
- Notifications for activity and reminders
- Admin dashboard for service management

## Tech Stack
- **Backend**: Node.js (Express) or Python (FastAPI)
- **Database**: PostgreSQL
- **Messaging**: Firebase or Socket.io
- **Authentication**: OAuth + JWT
- **Payments**: Stripe Connect, PayPal Payouts
- **Frontend**: React for Web, React Native / Flutter for Mobile
- **Deployment**: Replit Deployments or external (Render/AWS)

## Key Services & APIs
- **User Service**: Register, login, verify account, manage profile
- **DumpRun Service**: Create run, join requests, load tracking
- **Messaging Service**: Per-run chat, moderation hooks
- **Payment Service**: Split fee logic, escrow system, payout triggers
- **Scheduling Service**: Weekly or single pickups, no-show charge
- **Notification Service**: Reminders and status updates

## Development Steps

1. **User Auth & Verification**
   - Support email, phone, or social login
   - Store verification status and payout account link

2. **Dump Run System**
   - Support creating, joining, and moderating runs
   - Suggest nearby dump sites with geo-coordinates

3. **Real-Time Messaging**
   - Firebase channels or custom WebSocket layer
   - Store messages per run, user pair

4. **Payments**
   - Fee split on volume
   - Auto-release for verified users, escrow for others
   - Region-based fee profile for On-Demand pickups

5. **Scheduling**
   - Weekly recurring pickups with auto-booking
   - One-time pickups supported
   - Enforce charge for missed slots

6. **Notifications**
   - FCM, email, or SMS integration
   - Status changes, chat messages, approvals

7. **Admin Panel**
   - User, run, and payment management
   - Site config, fee profiles, abuse monitoring

## How to Start on Replit

- Create a new Replit project
- Select the language (Node.js or Python)
- Install dependencies via `package.json` or `requirements.txt`
- Setup `.env` file with API keys (Stripe, Firebase, etc.)
- Use Replit DB or connect to an external PostgreSQL DB
- Begin with User Service, then build features incrementally

## Next Steps

- Use Postman or Swagger for API testing
- Generate frontend scaffolding with Replit's React templates
- Create seed data for dump sites
- Set up basic cron or interval-based job for weekly scheduling
