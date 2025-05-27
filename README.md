# FitTrack - Fitness Tracking App

A comprehensive fitness tracking application built with React, Express, and PostgreSQL that allows users to create workouts, track exercises, and monitor their progress.

## Features

- 📊 Dashboard with workout statistics and progress charts
- 💪 62 pre-loaded exercises across 7 categories
- 🏋️ Custom workout creation and management
- 📈 Personal records tracking
- 🔐 Social media authentication (Facebook, Google, Instagram)
- 📱 Responsive design for mobile and desktop

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed on your machine
- Git (to clone the repository)

### Running Locally

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fittrack-app
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Open your browser and go to: `http://localhost:5000`
   - The database will be automatically set up and populated with exercises

### What happens when you run docker-compose up:

1. **PostgreSQL Database**: Starts on port 5432 with initial setup
2. **FitTrack App**: Builds and starts on port 5000
3. **Database Migration**: Automatically creates tables and loads 62 exercises
4. **Ready to use**: Navigate to localhost:5000 to start tracking workouts!

## Configuration

### Environment Variables

The app uses these environment variables (already configured in docker-compose.yml):

```env
DATABASE_URL=postgresql://fittrack:fittrack123@postgres:5432/fittrack
SESSION_SECRET=your-super-secret-session-key-change-in-production
```

### OAuth Setup (Optional)

To enable social media login, add your OAuth credentials to docker-compose.yml:

```yaml
environment:
  # Facebook OAuth
  FACEBOOK_APP_ID: your_facebook_app_id
  FACEBOOK_APP_SECRET: your_facebook_app_secret
  
  # Google OAuth
  GOOGLE_CLIENT_ID: your_google_client_id
  GOOGLE_CLIENT_SECRET: your_google_client_secret
  
  # Instagram OAuth
  INSTAGRAM_CLIENT_ID: your_instagram_client_id
  INSTAGRAM_CLIENT_SECRET: your_instagram_client_secret
```

## Development

### Docker Commands

```bash
# Start the application
docker-compose up

# Start in background
docker-compose up -d

# Rebuild the application
docker-compose up --build

# Stop the application
docker-compose down

# View logs
docker-compose logs app
docker-compose logs postgres

# Reset database (removes all data)
docker-compose down -v
docker-compose up --build
```

### Database Management

```bash
# Connect to PostgreSQL
docker exec -it fittrack-db psql -U fittrack -d fittrack

# View tables
\dt

# Reset database schema
docker-compose exec app npm run db:push
```

## Project Structure

```
fittrack-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   └── lib/           # Utilities and query client
├── server/                 # Express backend
│   ├── auth/              # OAuth authentication system
│   ├── data/              # Exercise data
│   └── routes.ts          # API routes
├── shared/                # Shared types and schemas
├── docker-compose.yml     # Docker configuration
└── Dockerfile            # Application container
```

## API Endpoints

- `GET /api/exercises` - Get all exercises
- `GET /api/workouts` - Get user workouts
- `GET /api/stats/*` - Various statistics endpoints
- `GET /auth/facebook` - Facebook OAuth login
- `GET /auth/google` - Google OAuth login
- `GET /auth/instagram` - Instagram OAuth login

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with OAuth strategies
- **Containerization**: Docker & Docker Compose

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Stop any running services on port 5000 or 5432
   docker-compose down
   ```

2. **Database connection issues**
   ```bash
   # Restart the database service
   docker-compose restart postgres
   ```

3. **App not loading**
   ```bash
   # Check logs for errors
   docker-compose logs app
   ```

### Fresh Start

If you encounter persistent issues:

```bash
# Complete reset
docker-compose down -v
docker system prune -f
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

This project is licensed under the MIT License.