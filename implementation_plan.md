# VA Group Psychoeducation Application - Implementation Plan

## Executive Summary

This document outlines the implementation plan for a facilitator-led, interactive group psychoeducation web application for the U.S. Department of Veterans Affairs. The application uses playful, engaging mechanics to help veterans practice evidence-based tools (CBT, mindfulness) in group settings, with strict adherence to participant autonomy, data privacy, and clinical humility.

**Core Philosophy**: Fun and curiosity drive learning. No competition, scoring, or automated inference. Full participant autonomy with facilitator control.

---

## Phase Breakdown

### Phase 1: Core Infrastructure + CBT Reframe Relay Module (MVP)
**Timeline**: Initial implementation
**Scope**: 
- ✅ User authentication (email/password, roles)
- ✅ Care team management
- ✅ Prompt pack creation/editing
- ✅ Session creation and management
- ✅ Real-time WebSocket infrastructure
- ✅ CBT Reframe Relay module (single module)
- ✅ Participant join flow (QR/room code)
- ✅ Facilitator console (desktop)
- ✅ Participant interface (mobile)
- ✅ Response moderation (spotlight/hide/save)
- ✅ Session summary generation
- ✅ 72-hour auto-purge system
- ✅ Audit logging
- ✅ Media asset management

**Excluded from Phase 1**:
- ❌ Additional modules (stubbed only)
- ❌ SSO integration (interface scaffolded, not implemented)
- ❌ Advanced facilitator analytics
- ❌ Multi-session scheduling
- ❌ Participant history/continuity

### Phase 2: Additional Modules & Enhanced Features
**Scope**:
- Mindfulness module
- Additional evidence-based practice modules
- Enhanced media support (video playback controls)
- Session templates
- Participant pseudonym continuity across sessions

### Phase 3: Advanced Features & Integration
**Scope**:
- SSO integration (if required)
- Advanced care team collaboration
- Session scheduling system
- Enhanced facilitator tools
- Export capabilities (within retention window)

---

## Clinical Risk Mitigation

### Data Privacy & Security
- **72-hour retention**: All participant responses auto-purged after 72 hours (configurable)
- **No persistent tracking**: No device identifiers, cookies, or cross-session tracking
- **Explicit consent**: Participants explicitly join sessions; skipping is always neutral
- **Audit trail**: All access to sensitive data logged with user ID and timestamp
- **Care team access**: Limited to explicitly saved material and neutral summaries only

### Participant Safety
- **Full autonomy**: Participants can skip, pass, or leave at any time
- **No pressure**: No scores, rankings, or performance metrics
- **Facilitator control**: Licensed therapists control all pacing and content visibility
- **Safe defaults**: All sharing defaults to facilitator-only; spotlighting is explicit

### Clinical Humility
- **No automated inference**: No sentiment analysis, risk detection, or diagnostic scoring
- **No behavioral metrics**: No timing data, skip counts, or response rates in summaries
- **Neutral summaries**: Session summaries contain only explicitly saved content and attendance notes
- **Facilitator judgment**: All clinical interpretation remains with licensed facilitators

---

## Data Model (Prisma Schema)

```prisma
// ============================================
// CORE USER & AUTHENTICATION
// ============================================

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          UserRole @default(CLINICIAN)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  careTeamMemberships CareTeamMember[]
  createdSessions     Session[]
  auditLogs           AuditLog[]
  
  @@map("users")
}

enum UserRole {
  FACILITATOR  // Can create and run sessions
  CLINICIAN    // Can view summaries and saved responses
}

// ============================================
// CARE TEAM STRUCTURE
// ============================================

model CareTeam {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  members     CareTeamMember[]
  sessions    Session[]
  
  @@map("care_teams")
}

model CareTeamMember {
  id          String   @id @default(cuid())
  careTeamId  String
  userId      String
  role        CareTeamRole @default(MEMBER)
  joinedAt    DateTime @default(now())
  
  // Relations
  careTeam    CareTeam @relation(fields: [careTeamId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([careTeamId, userId])
  @@map("care_team_members")
}

enum CareTeamRole {
  LEAD      // Can manage team and create sessions
  MEMBER    // Can view summaries and saved responses
}

// ============================================
// CONTENT MANAGEMENT
// ============================================

model PromptPack {
  id          String   @id @default(cuid())
  name        String
  description String?
  topicTags   String[] // e.g., ["anxiety", "depression", "relationships"]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  prompts     Prompt[]
  sessions    Session[]
  
  @@map("prompt_packs")
}

model Prompt {
  id            String   @id @default(cuid())
  promptPackId  String
  text          String
  topicTags     String[]
  intensity     Int      @default(3) // 1-5 scale
  facilitatorNotes String? // Private notes for facilitator
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  promptPack    PromptPack @relation(fields: [promptPackId], references: [id], onDelete: Cascade)
  responses     Response[]
  
  @@map("prompts")
}

model MediaAsset {
  id          String   @id @default(cuid())
  name        String
  description String?
  type        MediaType
  url         String   // Uploaded file URL or external URL
  mimeType    String?
  sizeBytes   Int?
  createdAt   DateTime @default(now())
  
  // Relations
  sessions    Session[]
  
  @@map("media_assets")
}

enum MediaType {
  VIDEO
  AUDIO
  IMAGE
  DOCUMENT
}

// ============================================
// SESSION & PARTICIPANT DATA
// ============================================

model Session {
  id                String   @id @default(cuid())
  careTeamId        String
  facilitatorId     String
  moduleId          String   // e.g., "cbt_reframe_relay"
  promptPackId      String
  roomCode          String   @unique // 6-character alphanumeric
  status            SessionStatus @default(CREATED)
  numRounds         Int      @default(3)
  sharingDefaults   Json     // Module-specific sharing defaults
  introMediaId      String?  // Required intro media
  currentRound      Int      @default(0)
  currentPromptId   String?
  introCompleted    Boolean  @default(false)
  createdAt         DateTime @default(now())
  startedAt         DateTime?
  endedAt           DateTime?
  purgeAfter        DateTime // Auto-purge timestamp (createdAt + 72 hours)
  
  // Relations
  careTeam          CareTeam   @relation(fields: [careTeamId], references: [id], onDelete: Restrict)
  facilitator       User       @relation(fields: [facilitatorId], references: [id], onDelete: Restrict)
  promptPack        PromptPack @relation(fields: [promptPackId], references: [id], onDelete: Restrict)
  introMedia        MediaAsset? @relation(fields: [introMediaId], references: [id], onDelete: SetNull)
  currentPrompt     Prompt?    @relation(fields: [currentPromptId], references: [id], onDelete: SetNull)
  participants      Participant[]
  responses         Response[]
  summary           SessionSummary?
  auditLogs         AuditLog[]
  
  @@index([roomCode])
  @@index([purgeAfter]) // For purge job
  @@map("sessions")
}

enum SessionStatus {
  CREATED      // Session created, waiting for participants
  LOBBY        // Participants joining
  INTRO        // Intro media playing
  IN_PROGRESS  // Active rounds
  ENDED        // Session completed
}

model Participant {
  id              String   @id @default(cuid())
  sessionId       String
  nickname        String   // Anonymous display name
  pseudonymId     String?  // Optional facilitator-provided pseudonymous ID
  socketId        String?  // Current WebSocket connection ID
  joinedAt        DateTime @default(now())
  lastSeenAt      DateTime @default(now())
  
  // Relations
  session         Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  responses       Response[]
  
  @@index([sessionId])
  @@map("participants")
}

model Response {
  id                String   @id @default(cuid())
  sessionId         String
  participantId     String
  promptId          String
  roundNumber       Int
  alternativeThought String  // Required field for CBT Reframe Relay
  automaticThought  String?  // Optional
  emotionPre        Int?     // 0-10, optional
  emotionPost       Int?     // 0-10, optional
  submittedAt       DateTime @default(now())
  
  // Moderation flags
  isSpotlighted     Boolean  @default(false) // Shown anonymously to group
  isHidden          Boolean  @default(false) // Hidden from facilitator view
  isSavedForFollowup Boolean @default(false) // Saved to summary
  
  // Relations
  session           Session    @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  prompt            Prompt     @relation(fields: [promptId], references: [id], onDelete: Restrict)
  
  @@index([sessionId])
  @@index([purgeAfter]) // For purge job (computed from session.purgeAfter)
  @@map("responses")
}

// ============================================
// SESSION SUMMARY (TEMPORARY)
// ============================================

model SessionSummary {
  id                String   @id @default(cuid())
  sessionId         String   @unique
  moduleId          String
  numRounds         Int
  attendanceNote    String   // e.g., "present", "partial"
  savedResponses    Json     // Array of responses marked for follow-up
  generatedAt       DateTime @default(now())
  purgeAfter        DateTime // Auto-purge timestamp (generatedAt + 72 hours)
  
  // Relations
  session           Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@index([purgeAfter]) // For purge job
  @@map("session_summaries")
}

// ============================================
// AUDIT LOGGING
// ============================================

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  sessionId   String?
  action      String   // e.g., "VIEW_SUMMARY", "ACCESS_SAVED_RESPONSE", "CREATE_SESSION"
  resourceType String? // e.g., "SessionSummary", "Response"
  resourceId  String?
  metadata    Json?    // Additional context
  createdAt   DateTime @default(now())
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Restrict)
  session     Session? @relation(fields: [sessionId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([sessionId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

### Purge Logic

**Background Job** (runs hourly):
1. Find all `Session` records where `purgeAfter < now()`
2. For each expired session:
   - Cascade delete: `Participant`, `Response`, `SessionSummary`
   - Update `Session.status = ENDED` (if not already)
   - Log purge action in `AuditLog`

**Configuration**:
- Default retention: 72 hours
- Configurable via environment variable: `SESSION_RETENTION_HOURS`

---

## WebSocket Message Schema (TypeScript)

```typescript
// ============================================
// CLIENT → SERVER MESSAGES
// ============================================

// Facilitator Messages
interface FacilitatorMessage {
  type: FacilitatorMessageType;
  sessionId?: string;
  payload?: any;
}

type FacilitatorMessageType =
  | 'createSession'
  | 'startSession'
  | 'nextPrompt'
  | 'spotlightResponse'
  | 'hideResponse'
  | 'saveForFollowup'
  | 'endSession'
  | 'markIntroCompleted';

interface CreateSessionPayload {
  careTeamId: string;
  moduleId: string;
  promptPackId: string;
  numRounds: number;
  sharingDefaults: Record<string, any>;
  introMediaId: string;
}

interface StartSessionPayload {
  sessionId: string;
}

interface NextPromptPayload {
  sessionId: string;
  promptId: string;
}

interface SpotlightResponsePayload {
  sessionId: string;
  responseId: string;
}

interface HideResponsePayload {
  sessionId: string;
  responseId: string;
}

interface SaveForFollowupPayload {
  sessionId: string;
  responseId: string;
}

interface EndSessionPayload {
  sessionId: string;
}

// Participant Messages
interface ParticipantMessage {
  type: ParticipantMessageType;
  sessionId: string;
  payload?: any;
}

type ParticipantMessageType =
  | 'join'
  | 'submitResponse'
  | 'skip';

interface JoinPayload {
  nickname: string;
  pseudonymId?: string;
  roomCode: string;
}

interface SubmitResponsePayload {
  promptId: string;
  alternativeThought: string;
  automaticThought?: string;
  emotionPre?: number;
  emotionPost?: number;
}

interface SkipPayload {
  promptId: string;
}

// ============================================
// SERVER → CLIENT MESSAGES
// ============================================

interface ServerMessage {
  type: ServerMessageType;
  sessionId: string;
  payload: any;
}

type ServerMessageType =
  | 'sessionState'
  | 'currentPrompt'
  | 'responsesUpdate'
  | 'participantListUpdate'
  | 'error';

interface SessionStatePayload {
  status: SessionStatus;
  currentRound: number;
  numRounds: number;
  introCompleted: boolean;
  currentPromptId?: string;
  introMedia?: {
    id: string;
    url: string;
    type: MediaType;
  };
}

interface CurrentPromptPayload {
  promptId: string;
  text: string;
  roundNumber: number;
  topicTags: string[];
  intensity: number;
}

interface ResponsesUpdatePayload {
  spotlightedResponses: Array<{
    id: string;
    alternativeThought: string;
    automaticThought?: string;
    emotionPre?: number;
    emotionPost?: number;
    // NO participant identifier
  }>;
}

interface ParticipantListUpdatePayload {
  participants: Array<{
    id: string;
    nickname: string;
    // NO pseudonymId (facilitator-only)
  }>;
}

interface ErrorPayload {
  code: string;
  message: string;
}

// ============================================
// SOCKET.IO ROOM STRUCTURE
// ============================================

// Rooms:
// - `session:${sessionId}` - All participants and facilitator
// - `facilitator:${sessionId}` - Facilitator only (for moderation data)
// - `participant:${participantId}` - Individual participant (for private updates)
```

---

## Next.js Folder Structure

```
va-group-psychoeducation/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── assets/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                   # Landing/home page
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (facilitator)/            # Facilitator routes (protected)
│   │   │   ├── layout.tsx            # Facilitator layout (desktop)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Session list, create session
│   │   │   ├── sessions/
│   │   │   │   ├── [sessionId]/
│   │   │   │   │   └── page.tsx      # Facilitator console
│   │   │   │   └── create/
│   │   │   │       └── page.tsx      # Create session form
│   │   │   ├── prompt-packs/
│   │   │   │   ├── page.tsx          # List prompt packs
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [packId]/
│   │   │   │       └── page.tsx      # Edit prompt pack
│   │   │   └── care-teams/
│   │   │       └── page.tsx          # Manage care teams
│   │   ├── (participant)/            # Participant routes (public, room code)
│   │   │   ├── join/
│   │   │   │   └── page.tsx          # Join form (nickname, room code)
│   │   │   └── session/
│   │   │       └── [sessionId]/
│   │   │           └── page.tsx       # Participant controller (mobile)
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/    # Auth endpoints (if using NextAuth)
│   │   │   └── health/
│   │   │       └── route.ts          # Health check
│   │   └── globals.css                # Tailwind imports
│   ├── components/
│   │   ├── ui/                        # Reusable UI components (buttons, inputs, etc.)
│   │   ├── facilitator/
│   │   │   ├── SessionConsole.tsx
│   │   │   ├── ParticipantList.tsx
│   │   │   ├── ResponseModeration.tsx
│   │   │   ├── PromptControl.tsx
│   │   │   └── QRCodeDisplay.tsx
│   │   ├── participant/
│   │   │   ├── JoinForm.tsx
│   │   │   ├── PromptDisplay.tsx
│   │   │   ├── ResponseForm.tsx
│   │   │   └── SpotlightedResponses.tsx
│   │   └── shared/
│   │       ├── MediaPlayer.tsx
│   │       └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── prisma.ts                  # Prisma client singleton
│   │   ├── auth.ts                    # Auth utilities
│   │   ├── room-code.ts               # Room code generation
│   │   └── purge-job.ts               # Purge job logic
│   ├── stores/                        # Zustand stores
│   │   ├── facilitator-store.ts       # Facilitator session state
│   │   ├── participant-store.ts       # Participant session state
│   │   └── auth-store.ts              # Auth state
│   ├── types/
│   │   ├── websocket.ts                # WebSocket message types
│   │   ├── session.ts                  # Session types
│   │   ├── module.ts                   # Module interface types
│   │   └── database.ts                 # Prisma-generated types
│   ├── modules/                       # Module implementations
│   │   ├── base/
│   │   │   └── module.interface.ts    # Base module interface
│   │   ├── cbt-reframe-relay/
│   │   │   ├── index.ts               # Module definition
│   │   │   ├── schemas.ts             # Prompt/input/summary schemas
│   │   │   └── components.tsx         # Module-specific components
│   │   └── stubs/                     # Stubbed future modules
│   │       ├── mindfulness.ts
│   │       └── ...
│   ├── server/                        # Custom Node.js server
│   │   ├── server.ts                  # Main server (Next.js + Socket.io)
│   │   ├── socket-handlers/
│   │   │   ├── facilitator.ts         # Facilitator message handlers
│   │   │   ├── participant.ts         # Participant message handlers
│   │   │   └── broadcast.ts           # Broadcast utilities
│   │   └── jobs/
│   │       └── purge-job.ts           # Scheduled purge job
│   └── middleware.ts                  # Next.js middleware (auth, routes)
├── server.ts                          # Entry point (custom server)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── docker-compose.yml                 # PostgreSQL + Redis (if needed)
├── Dockerfile                          # Production Docker image
└── .env.example
```

---

## Module Interface (TypeScript)

```typescript
// Base module interface that all modules must implement
interface Module {
  id: string;
  displayName: string;
  description: string;
  
  // Schema definitions
  promptSchema: ZodSchema; // Validates prompts in PromptPack
  participantInputSchema: ZodSchema; // Validates participant responses
  facilitatorControls: FacilitatorControl[];
  summarySchema: ZodSchema; // Validates SessionSummary content
  
  // Module-specific logic
  generateSummary(
    session: Session,
    responses: Response[],
    participants: Participant[]
  ): Promise<SessionSummaryData>;
  
  // Optional hooks
  onSessionStart?(session: Session): Promise<void>;
  onSessionEnd?(session: Session): Promise<void>;
  onPromptChange?(session: Session, prompt: Prompt): Promise<void>;
}

interface FacilitatorControl {
  id: string;
  label: string;
  action: string; // e.g., "spotlight", "hide", "saveForFollowup"
  icon?: string;
}

// CBT Reframe Relay Module Implementation
const cbtReframeRelayModule: Module = {
  id: 'cbt_reframe_relay',
  displayName: 'CBT Reframe Relay',
  description: 'Practice identifying alternative, balanced thoughts',
  
  promptSchema: z.object({
    text: z.string().min(1),
    topicTags: z.array(z.string()),
    intensity: z.number().min(1).max(5),
  }),
  
  participantInputSchema: z.object({
    alternativeThought: z.string().min(1),
    automaticThought: z.string().optional(),
    emotionPre: z.number().min(0).max(10).optional(),
    emotionPost: z.number().min(0).max(10).optional(),
  }),
  
  facilitatorControls: [
    { id: 'spotlight', label: 'Spotlight', action: 'spotlightResponse' },
    { id: 'hide', label: 'Hide', action: 'hideResponse' },
    { id: 'save', label: 'Save for Follow-up', action: 'saveForFollowup' },
  ],
  
  summarySchema: z.object({
    moduleId: z.literal('cbt_reframe_relay'),
    numRounds: z.number(),
    attendanceNote: z.string(),
    savedResponses: z.array(z.object({
      participantId: z.string(),
      pseudonymId: z.string().optional(),
      alternativeThought: z.string(),
      automaticThought: z.string().optional(),
    })),
  }),
  
  async generateSummary(session, responses, participants) {
    // Implementation: extract saved responses, generate attendance note
    // NO timing data, skip counts, or behavioral observations
  },
};
```

---

## Acceptance Criteria Checklist

### Authentication & Authorization
- [ ] Users can register with email/password
- [ ] Users can log in with email/password
- [ ] Role-based access control (FACILITATOR, CLINICIAN)
- [ ] Protected routes enforce role requirements
- [ ] SSO interface scaffolded (not implemented)

### Care Team Management
- [ ] Facilitators can create care teams
- [ ] Facilitators can add/remove care team members
- [ ] Care team members can view summaries and saved responses (within retention window)
- [ ] All care team access logged in AuditLog

### Prompt Pack Management
- [ ] Facilitators can create prompt packs
- [ ] Facilitators can add/edit/delete prompts
- [ ] Prompts support topic tags and intensity (1-5)
- [ ] Prompts support private facilitator notes
- [ ] Prompt packs can be reused across sessions

### Media Asset Management
- [ ] Facilitators can upload media files or provide external URLs
- [ ] Media assets support video, audio, image, document types
- [ ] Media metadata stored (name, description, mimeType, sizeBytes)

### Session Creation
- [ ] Facilitators can create sessions with:
  - [ ] Care team selection
  - [ ] Module selection (CBT Reframe Relay only in Phase 1)
  - [ ] Prompt pack selection (filtered by topic/intensity)
  - [ ] Number of rounds configuration
  - [ ] Sharing defaults configuration
  - [ ] Required intro media selection
- [ ] Unique 6-character room code generated
- [ ] QR code generated for room code URL

### Participant Join Flow
- [ ] Participants can join via QR code scan
- [ ] Participants can join via room code entry
- [ ] Participants enter nickname (anonymous)
- [ ] Participants can optionally enter pseudonym ID
- [ ] Join flow works in mobile browsers (no app install)
- [ ] Responsive, mobile-first UI

### Real-Time WebSocket Infrastructure
- [ ] Custom Node.js server hosts Next.js app and Socket.io server
- [ ] WebSocket connections persist across page navigation
- [ ] Room-based messaging (session rooms, facilitator rooms, participant rooms)
- [ ] Message types strictly typed (TypeScript interfaces)
- [ ] Error handling and reconnection logic

### Facilitator Console
- [ ] Desktop-optimized layout
- [ ] View participant list (nicknames only)
- [ ] View all responses in real time (with moderation controls)
- [ ] Control session flow (start, next prompt, end)
- [ ] Spotlight responses (show anonymously to group)
- [ ] Hide responses from view
- [ ] Save responses for 1:1 follow-up
- [ ] View QR code and room code
- [ ] Control intro media playback

### Participant Interface
- [ ] Mobile-optimized layout
- [ ] View current prompt
- [ ] View intro media (if applicable)
- [ ] Submit response form (alternative thought required, others optional)
- [ ] Skip/pass option (neutral, no consequence)
- [ ] View spotlighted responses (anonymously)
- [ ] Never see other participants' raw responses
- [ ] Never see facilitator notes
- [ ] Wake Lock API prevents screen sleep during active participation

### CBT Reframe Relay Module
- [ ] Module implements full Module interface
- [ ] Prompts display correctly
- [ ] Response form captures:
  - [ ] Alternative thought (required)
  - [ ] Automatic thought (optional)
  - [ ] Emotion pre-rating 0-10 (optional)
  - [ ] Emotion post-rating 0-10 (optional)
- [ ] Responses validate against module schema
- [ ] Moderation actions work correctly
- [ ] Session summary generation includes only saved responses and attendance

### Session Summary
- [ ] Generated automatically on session end
- [ ] Contains only:
  - [ ] Module practiced
  - [ ] Number of rounds
  - [ ] Saved-for-follow-up responses (full text)
  - [ ] Attendance note
- [ ] NO timing data, skip counts, response rates, or behavioral observations
- [ ] Neutral, clinical tone

### Data Retention & Purge
- [ ] 72-hour retention timer set on session creation
- [ ] Background job runs hourly
- [ ] Expired sessions purge:
  - [ ] Participants (cascade)
  - [ ] Responses (cascade)
  - [ ] Session summaries (cascade)
- [ ] Purge action logged in AuditLog
- [ ] Retention period configurable via environment variable

### Audit Logging
- [ ] All care team access to summaries logged
- [ ] All access to saved responses logged
- [ ] Logs include: user ID, session ID, action, resource type, timestamp
- [ ] Logs queryable for compliance

### Accessibility (Section 508)
- [ ] High contrast colors (WCAG AA minimum)
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader tested
- [ ] Focus indicators visible
- [ ] Semantic HTML structure

### State Management (Zustand)
- [ ] Facilitator store manages:
  - [ ] Current session state
  - [ ] Participant list
  - [ ] Responses (with moderation state)
  - [ ] WebSocket connection status
- [ ] Participant store manages:
  - [ ] Current session state
  - [ ] Current prompt
  - [ ] Spotlighted responses
  - [ ] WebSocket connection status
- [ ] Stores update in real time via WebSocket messages

### Testing
- [ ] Real-time tested with multiple concurrent participants
- [ ] Purge job verified (test with short retention period)
- [ ] Audit logging verified
- [ ] WebSocket reconnection tested
- [ ] Mobile responsiveness tested
- [ ] Accessibility tested (keyboard, screen reader)

### Security
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS prevention (React auto-escaping, sanitization)
- [ ] CSRF protection (if applicable)
- [ ] Rate limiting on API endpoints
- [ ] Secure password hashing (bcrypt)
- [ ] Environment variables for sensitive config

---

## Technical Implementation Notes

### Custom Node.js Server Setup
```typescript
// server.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);
    await handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // Configure appropriately for production
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io handlers
  // ... (see socket-handlers/)

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

### Environment Variables
```bash
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/va_psychoeducation"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
SESSION_RETENTION_HOURS=72
NODE_ENV="development"
PORT=3000
```

### Docker Compose (Local Development)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: va_user
      POSTGRES_PASSWORD: va_password
      POSTGRES_DB: va_psychoeducation
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Risk Assessment

### Technical Risks
- **WebSocket scalability**: Socket.io supports horizontal scaling with Redis adapter (not in Phase 1)
- **Database performance**: Indexes on purgeAfter fields critical for purge job performance
- **Media storage**: Consider cloud storage (S3) for production (local filesystem acceptable for Phase 1)

### Clinical Risks
- **Data breach**: Mitigated by 72-hour purge, no persistent tracking, audit logging
- **Participant coercion**: Mitigated by full autonomy, neutral skip option, facilitator training required
- **Misuse of data**: Mitigated by strict summary schema, no behavioral metrics, care team access controls

### Compliance Risks
- **HIPAA**: Application handles PHI minimally; pseudonym IDs optional; 72-hour retention reduces risk
- **Section 508**: Accessibility requirements built into design
- **VA security standards**: TBD based on deployment environment

---

## Next Steps

1. **Review and approve this plan**
2. **Set up development environment**:
   - Install dependencies
   - Set up PostgreSQL (Docker Compose)
   - Configure environment variables
3. **Implement Phase 1**:
   - Database schema (Prisma)
   - Authentication system
   - Core UI components
   - WebSocket infrastructure
   - CBT Reframe Relay module
   - Purge job
   - Testing
4. **Deploy to staging** for facilitator testing
5. **Iterate based on feedback**

---

## Questions for Stakeholders

1. **SSO requirements**: Which SSO provider(s) should be supported? (Phase 3)
2. **Media storage**: Cloud storage (S3) required for production, or local filesystem acceptable?
3. **Deployment environment**: VA cloud, on-premises, or hybrid?
4. **Facilitator training**: Will facilitators receive training on the application?
5. **Participant onboarding**: Will participants receive any pre-session orientation?
6. **Retention period**: Is 72 hours acceptable, or should it be configurable per session?
7. **Audit log retention**: How long should audit logs be retained?

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Awaiting Approval

