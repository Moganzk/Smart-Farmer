📑 Project Plan: AI-Driven Crop Disease Detection & Advisory System
‎
‎1. Introduction
‎
‎This plan outlines the development of a mobile-first AI-powered crop disease detection and advisory system. The system leverages Gemini API for image analysis and Groq API for advisory while providing offline-first support for farmers in low-connectivity areas.
‎
‎The system distinguishes between two roles:
‎
‎👩🏾‍🌾 Farmers – disease detection, advisory, history, group chats.
‎
‎👨🏽‍💻 Admins – user management, disease/advisory content, analytics, moderation.
‎
‎
‎
‎---
‎
‎2. Objectives
‎
‎Main Objective
‎
‎Build a mobile and backend system that empowers Kenyan farmers to detect crop diseases and access advisory services efficiently, both offline and online.
‎
‎Specific Objectives
‎
‎Develop a React Native mobile app with offline SQLite support.
‎
‎Integrate Gemini API for crop disease detection.
‎
‎Integrate Groq API for advisory and general knowledge.
‎
‎Implement PostgreSQL backend for users, diseases, advisory, groups, and chats.
‎
‎Create separate farmer and admin roles with distinct features.
‎
‎Provide admin analytics for monitoring farmer adoption and common disease trends.
‎
‎Enable farmer-to-farmer collaboration via chat and groups.
‎
‎
‎
‎---
‎
‎3. Scope
‎
‎In-Scope:
‎
‎Mobile app (React Native) for farmers.
‎
‎PostgreSQL backend with role-based APIs.
‎
‎Gemini & Groq API integration.
‎
‎Offline SQLite storage.
‎
‎Farmer groups and chat.
‎
‎Admin dashboards for analytics and management.
‎
‎
‎Out-of-Scope:
‎
‎Hosting/deployment on cloud (local only).
‎
‎Training custom AI models.
‎
‎Enterprise-grade security or scaling.
‎
‎
‎
‎
‎---
‎
‎4. Deliverables
‎
‎Mobile App (Frontend)
‎
‎Farmer-facing features: capture → detect → advisory → history.
‎
‎Chat + groups system.
‎
‎Multilingual support.
‎
‎
‎Backend (API + PostgreSQL)
‎
‎Authentication & role-based access.
‎
‎Farmer APIs: detection, history, groups, messages.
‎
‎Admin APIs: manage users, advisory DB, analytics reports.
‎
‎
‎Documentation
‎
‎README.md at root.
‎
‎Sub-folder README.mds.
‎
‎API documentation (Gemini & Groq integration).
‎
‎Database schema diagrams.
‎
‎User manuals (farmer & admin).
‎
‎
‎
‎
‎---
‎
‎5. Development Phases
‎
‎Phase 1: Setup
‎
‎Initialize project repo + folder structure.
‎
‎Configure PostgreSQL schema (users, diseases, groups, messages, advisory).
‎
‎Setup React Native skeleton with SQLite.
‎
‎
‎Phase 2: Core Farmer Features
‎
‎Camera + photo upload.
‎
‎Disease detection via Gemini API.
‎
‎Advisory retrieval via Groq API.
‎
‎Store results offline (SQLite).
‎
‎
‎Phase 3: Admin Features
‎
‎User management (create, update, delete).
‎
‎Disease/advisory DB management.
‎
‎Analytics (queries on farmer activity, disease frequency).
‎
‎
‎Phase 4: Collaboration Features
‎
‎Group creation + search.
‎
‎Farmer chat system (basic messaging).
‎
‎Admin moderation tools.
‎
‎
‎Phase 5: Testing & Documentation
‎
‎Offline/online functionality tests.
‎
‎User acceptance testing with mock farmers/admins.
‎
‎Final documentation (manuals, diagrams, reports).
‎
‎
‎
‎---
‎
‎6. Risks & Mitigation
‎
‎Risk: Poor internet access limits API calls.
‎
‎Mitigation: Cache results + provide offline SQLite fallback.
‎
‎
‎Risk: Farmers upload poor-quality images.
‎
‎Mitigation: Provide image capture guidelines + pre-checks.
‎
‎
‎Risk: Time constraints for chat & groups.
‎
‎Mitigation: Start with basic text-only messaging.
‎
‎
‎Risk: Role confusion between admins & farmers.
‎
‎Mitigation: Enforce strict role-based auth at backend level.
‎
‎
‎
‎
‎---
‎
‎7. Tools & Technologies
‎
‎Frontend: React Native (Expo), SQLite
‎
‎Backend: Node.js (Express), PostgreSQL
‎
‎AI APIs: Gemini API, Groq API
‎
‎Docs & Planning: Markdown, Flowcharts, ER diagrams
‎
‎
‎
‎---
‎
‎8. Success Criteria
‎
‎Farmers can diagnose diseases offline/online.
‎
‎Admins can manage users + advisory content.
‎
Farmers can join groups and chat.
System works smoothly on low-end Android devices (<2GB RAM, <16GB storage).
All code + docs are modular, maintainable, and easy to debug.

---

9. Technical Constraints & Limitations

Data Management & Privacy
- Implement 90-day retention policy for farmer images
- Follow GDPR-inspired privacy guidelines for farmer data
- Weekly automated database backups
- Allow farmers to export their disease detection history
- Implement data anonymization for analytics

Performance Constraints
- Maximum image size: 5MB, resolution: 1920x1080
- SQLite storage limit: 500MB per device
- Maximum 100 members per farmer group
- Rate limits: 100 API calls/day/farmer for Gemini/Groq
- Maximum message history: 1000 messages per group

Technical Requirements
- Android 8.0+ and iOS 13.0+
- Minimum 3G network for sync operations
- JPEG/PNG compression to max 1MB for poor networks
- Maximum 50 concurrent users per chat group
- Background sync every 4 hours when online

Language & Localization
- Support for English, Swahili, and local dialects
- UTC timestamps with local conversion
- Regional crop name dictionary
- Locale-specific date and number formats

Security Measures
- 5 failed login attempts = 15-minute lockout
- Session timeout after 24 hours
- Minimum 8-character passwords with complexity
- End-to-end encryption for chat messages
- Admin action audit logs retained for 6 months

Error Handling
- 3 retry attempts for failed API calls
- Fallback to cached advisory data if recognition fails
- Exponential backoff for sync operations
- In-app error reporting with screenshots
- Offline queue for failed operations

Maintenance Protocols
- Advisory DB versioning with rollback support
- Forced app updates for critical changes
- Daily database backups, retained for 30 days
- Health monitoring dashboard for admins
- Monthly performance analytics reports

Resource Limits
- 100 saved images per farmer
- Maximum message length: 1000 characters
- File attachments limited to images only
- 1GB total storage quota per farmer
- Maximum 10 active groups per farmer

Validation Rules
- Minimum 720p image resolution
- Image blur detection pre-upload
- Profanity filtering in chat messages
- Required fields for advisory content
- Group names: 3-50 characters

User Experience Standards
- Maximum 72 hours offline sync retention
- 30-second timeout for API operations
- Sub-2-second app response time
- High contrast UI for accessibility
- Support for screen readers
- Offline indicator when disconnected
