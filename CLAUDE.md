# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Warriors Kasa - A React application for sports teams to record and manage fines. Built with Firebase for backend services and deployed to GitHub Pages.

## Commands

### Development
```bash
npm start          # Start development server on localhost:3000
npm run build      # Build production bundle
npm test           # Run tests in watch mode
```

### Deployment
```bash
npm run deploy     # Build and deploy to GitHub Pages (requires gh-pages setup)
```

## Architecture

### Technology Stack
- **Frontend**: React 18 with Create React App
- **UI Components**: Custom components with shadcn/ui integration
- **Styling**: Tailwind CSS with custom configuration
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v6
- **Deployment**: GitHub Pages

### Project Structure
- `src/components/` - React components including UI components from shadcn
- `src/components/ui/` - shadcn/ui components (button, form, input, etc.)
- `src/firebase/` - Firebase configuration
- `src/lib/` - Utility functions and Firebase service layer
- `src/styles/` - Global styles and Tailwind configuration

### Key Components
- **AppContent.js** - Main application logic and state management
- **firebaseService.js** - Abstraction layer for Firebase operations
- **PlayerForm/PlayerTable** - Player management interface
- **PenaltyForm/PenaltyTable** - Penalty management interface
- **PublicView/PublicPenalties** - Public-facing views
- **Login** - Authentication component

### Data Flow
1. Authentication handled through Firebase Auth
2. Data persistence in Firestore collections (`hraci` for players, `pokuty` for penalties)
3. File uploads managed via Firebase Storage
4. Real-time updates using Firestore listeners

### Environment Configuration
The app requires Firebase configuration via environment variables:
- Create a `.env` file in the root directory
- Required variables:
  - REACT_APP_FIREBASE_API_KEY
  - REACT_APP_FIREBASE_AUTH_DOMAIN
  - REACT_APP_FIREBASE_DATABASE_URL
  - REACT_APP_FIREBASE_PROJECT_ID
  - REACT_APP_FIREBASE_STORAGE_BUCKET
  - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  - REACT_APP_FIREBASE_APP_ID
  - REACT_APP_FIREBASE_MEASUREMENT_ID

### UI Framework
Uses shadcn/ui components configured in `components.json`:
- Style: new-york
- Base color: neutral
- CSS variables enabled
- Component aliases configured for @/components, @/lib, etc.