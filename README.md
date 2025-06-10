# DevLink - A Platform for Developer Collaboration

DevLink is a modern web platform that connects developers with projects and collaborators, functioning like a "Tinder for Developers." It enables efficient discovery and collaboration between developers and project owners.

## ✨ Features

### 🔄 Real-time Messaging & Notifications
- **Instant Messaging**: Real-time chat between matched users using Pusher
- **Live Notifications**: Instant notifications for applications, matches, and updates
- **WebSocket Support**: Powered by Pusher for reliable, scalable real-time communication

### 🤝 Smart Matching System
- **Swipe Interface**: Tinder-like discovery for projects and developers
- **Mutual Matching**: Connect when both parties show interest
- **Skill-based Matching**: Algorithm considers skills, experience, and project needs

### 👤 Developer Profiles
- **GitHub Integration**: Automatic profile population from GitHub
- **Skills Management**: Comprehensive skill listing and verification
- **Portfolio Showcase**: Display projects, contributions, and achievements

### 📋 Project Management
- **Project Creation**: Detailed project posting with role requirements
- **Application System**: Handle developer applications efficiently
- **Collaboration Tools**: Manage team members and project progress

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Pusher account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd devlink
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file with:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Pusher (for real-time features)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Documentation

- **[Real-time Setup Guide](REALTIME_SETUP.md)** - Complete guide to setting up Pusher for real-time features
- **[Project Description](project-description.md)** - Detailed project overview and feature specifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with GitHub OAuth
- **Real-time**: Pusher Channels
- **Deployment**: Vercel-ready

## 🚀 Deployment

This application is optimized for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

The real-time features work seamlessly on Vercel with no additional configuration needed.

## 🧪 Testing Real-time Features

1. Open the application in two browser windows
2. Log in as different users
3. Create a match between the users
4. Test instant messaging and notifications

Use the test script in `scripts/test-pusher.js` to verify Pusher connection.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (pages)/           # Application pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components
│   ├── matches/          # Match-related components
│   └── projects/         # Project-related components
├── lib/                  # Utility libraries
├── models/               # Database models
├── types/                # TypeScript definitions
└── hooks/                # Custom React hooks
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
