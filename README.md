# VA Group Psychoeducation Application

A facilitator-led, interactive group psychoeducation web application for the U.S. Department of Veterans Affairs. This application uses playful, engaging mechanics to help veterans practice evidence-based tools (CBT, mindfulness) in group settings.

## Features

- **Facilitator Console**: Desktop interface for licensed therapists to create and manage sessions
- **Participant Interface**: Mobile-first interface for veterans to join sessions via QR code or room code
- **Real-time Synchronization**: WebSocket-based real-time updates for all participants
- **CBT Reframe Relay Module**: Practice identifying alternative, balanced thoughts
- **Response Moderation**: Facilitators can spotlight, hide, or save responses for follow-up
- **72-Hour Auto-Purge**: Automatic deletion of participant data after 72 hours
- **Section 508 Compliant**: High contrast, ARIA labels, keyboard navigation, screen reader support

## Tech Stack

- **Next.js 14+** (App Router) with TypeScript
- **Custom Node.js Server** with Socket.io for WebSocket support
- **Prisma ORM** + PostgreSQL
- **Tailwind CSS** (mobile-first, Section 508 compliant)
- **Zustand** for state management
- **Docker Compose** for local PostgreSQL

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://va_user:va_password@localhost:5432/va_psychoeducation"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
SESSION_RETENTION_HOURS=72
NODE_ENV="development"
PORT=3000
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

### 3. Start PostgreSQL with Docker Compose

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432.

### 4. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

**Important**: The custom server (`server.ts`) runs both the Next.js app and Socket.io server in the same process. This is required for WebSocket functionality.

## Usage

### Creating a Facilitator Account

1. Navigate to `/register`
2. Enter email, password, and select "Facilitator" role
3. Log in at `/login`

### Creating a Session

1. Log in as a facilitator
2. Navigate to Dashboard
3. Click "Create Session"
4. Select:
   - Care Team
   - Module (CBT Reframe Relay)
   - Prompt Pack
   - Number of rounds
   - Intro media
5. Share the QR code or room code with participants

### Joining as a Participant

1. Navigate to `/join` or scan QR code
2. Enter room code
3. Enter nickname (and optional pseudonym ID)
4. Join the session

### Running a Session

1. **Lobby**: Participants join via room code
2. **Intro**: Play intro media, facilitator marks as completed
3. **Rounds**: Facilitator selects prompts, participants submit responses
4. **Moderation**: Facilitator can spotlight, hide, or save responses
5. **End**: Session summary is generated automatically

## Project Structure

```
va-group-psychoeducation/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (facilitator)/     # Facilitator routes
│   │   ├── (participant)/     # Participant routes
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── facilitator/       # Facilitator UI components
│   │   ├── participant/       # Participant UI components
│   │   └── shared/            # Shared components
│   ├── lib/                   # Utilities
│   ├── modules/               # Module implementations
│   │   └── cbt-reframe-relay/ # CBT Reframe Relay module
│   ├── server/                # Custom server code
│   │   ├── socket-handlers/   # WebSocket handlers
│   │   └── jobs/              # Background jobs (purge)
│   ├── stores/                # Zustand stores
│   └── types/                 # TypeScript types
├── server.ts                  # Custom Node.js server entry point
└── docker-compose.yml         # PostgreSQL setup
```

## Key Features

### Data Privacy

- **72-Hour Retention**: All participant responses auto-purged after 72 hours
- **No Persistent Tracking**: No device identifiers or cross-session tracking
- **Explicit Consent**: Participants explicitly join sessions
- **Audit Logging**: All access to sensitive data logged

### Participant Safety

- **Full Autonomy**: Participants can skip, pass, or leave at any time
- **No Pressure**: No scores, rankings, or performance metrics
- **Facilitator Control**: Licensed therapists control all pacing and content visibility
- **Safe Defaults**: All sharing defaults to facilitator-only

### Clinical Humility

- **No Automated Inference**: No sentiment analysis, risk detection, or diagnostic scoring
- **No Behavioral Metrics**: No timing data, skip counts, or response rates in summaries
- **Neutral Summaries**: Session summaries contain only explicitly saved content and attendance notes
- **Facilitator Judgment**: All clinical interpretation remains with licensed facilitators

## Development

### Database Migrations

```bash
# Create a new migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Type Checking

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `NEXTAUTH_SECRET` | Secret for session encryption | Required |
| `NEXTAUTH_URL` | Base URL of the application | `http://localhost:3000` |
| `SESSION_RETENTION_HOURS` | Hours before auto-purge | `72` |
| `PORT` | Server port | `3000` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL | `http://localhost:3000` |

## Testing

The application includes:
- Real-time WebSocket testing with multiple concurrent participants
- Purge job verification (test with short retention period)
- Audit logging verification
- Mobile responsiveness testing
- Accessibility testing (keyboard, screen reader)

## Deployment

### Docker Production Build

```bash
docker build -t va-psychoeducation .
docker run -p 3000:3000 --env-file .env va-psychoeducation
```

### Environment Setup

Ensure all environment variables are set in production. Use a secure `NEXTAUTH_SECRET` and configure `DATABASE_URL` for your production database.

## License

This project is developed for the U.S. Department of Veterans Affairs.

## Support

For issues or questions, please contact the development team.

---

**Important Notes**:
- This is NOT a party game, consumer therapy software, or diagnostic system
- It is a facilitator-led "skills engagement experience" for group settings
- All clinical interpretation remains with licensed facilitators
- Participant data is automatically purged after 72 hours

