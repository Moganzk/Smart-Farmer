# Smart Farmer 🌱

AI-Driven Crop Disease Detection & Advisory System for Kenyan Farmers

## Overview 📌

Smart Farmer is a comprehensive mobile-first solution that empowers Kenyan farmers with AI-powered crop disease detection and expert advisory services. Built with offline-first capabilities, it ensures farmers can access critical information even in areas with limited connectivity.

### Key Features

#### For Farmers 👩🏾‍🌾
- Instant crop disease detection using AI
- Personalized treatment advisory
- Offline access to previous diagnoses
- Community support through farmer groups
- Real-time chat with other farmers
- Multilingual support (English/Swahili)

#### For Admins 👨🏽‍💻
- User management dashboard
- Disease & advisory content management
- Analytics on farmer adoption rates
- Community moderation tools
- Performance monitoring

## Tech Stack ⚙️

### Mobile App (Frontend)
- React Native (Expo)
- SQLite for offline storage
- Image compression & caching
- Offline-first architecture

### Backend
- Node.js (Express)
- PostgreSQL database
- Role-based access control
- RESTful API design

### AI Services
- Gemini API (Image Analysis)
- Groq API (Knowledge/Advisory)

## Getting Started 🚀

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Android Studio/Xcode
- API keys for Gemini & Groq

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-farmer.git
cd smart-farmer
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and database credentials
```

3. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. Initialize database:
```bash
cd ../database
psql -U postgres -f schema.sql
```

5. Start development servers:
```bash
# Backend
cd ../backend
npm run dev

# Frontend
cd ../frontend
npm start
```

## Project Structure 📁

```
smart-farmer/
├── BACKEND/          # Node.js + Express backend
├── DATABASE/         # PostgreSQL schemas & migrations
├── DOCS/            # Documentation & user manuals
├── FLOWCHARTS/      # System architecture diagrams
├── FRONTEND/        # React Native mobile app
├── README.md        # Project documentation
└── ROADMAP.md       # Development roadmap
```

## Technical Constraints 🔧

- Image Size: Max 5MB, 1920x1080px
- Storage: 500MB SQLite (device), 1GB total/farmer
- Network: Supports 3G+, offline-first
- Platform: Android 8.0+, iOS 13.0+
- Security: End-to-end chat encryption
- Performance: <2s response time
- Backup: Daily DB backups, 30-day retention

## Contributing 🤝

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Google Gemini API for image analysis
- Groq API for advisory services
- The Kenyan farming community for valuable feedback
