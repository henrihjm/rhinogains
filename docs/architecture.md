# Architecture Overview

High-level explanation of the Rhino Gains MVP architecture, covering routing, state management, persistence, and testing.

## Application Structure

```
RhinoGains/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home screen
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── workout/
│   │   ├── select/        # Workout type selection
│   │   ├── active/        # Active workout logging
│   │   └── [id]/          # Workout detail/edit (dynamic route)
│   └── history/           # Workout history
├── components/            # Reusable React components
├── lib/                   # Utilities and data layer
│   ├── types.ts          # TypeScript type definitions
│   └── db.ts             # Database operations (Dexie)
└── e2e/                   # Playwright E2E tests
```

## Routing

### Next.js App Router
The app uses Next.js 14's App Router with file-based routing:

- **`/`** → Home screen (`app/page.tsx`)
- **`/workout/select`** → Workout type selection (`app/workout/select/page.tsx`)
- **`/workout/active`** → Active workout logging (`app/workout/active/page.tsx`)
- **`/workout/[id]`** → Workout detail/edit (`app/workout/[id]/page.tsx`)
- **`/history`** → Workout history (`app/history/page.tsx`)

### Navigation Flow

```
Home
  ├─→ Workout Select → Active Workout → Save → Home
  │                              └─→ Discard → Home
  │
  └─→ History → Workout Detail → Edit → Save → View
                              └─→ Delete → History
                              └─→ Back → History
```

### Client-Side Navigation
- Uses Next.js `useRouter()` hook for programmatic navigation
- `Link` components for declarative navigation
- No server-side routing needed (fully client-side app)

## State Management

### Local Component State
The app uses React's built-in state management (`useState`, `useEffect`):

**Active Workout State:**
- Stored in `sessionStorage` (temporary, not persisted)
- Lives in `/workout/active` page component
- Cleared when workout is saved or discarded
- Prevents data loss on accidental refresh

**Edit Mode State:**
- Stored in component state (`useState`)
- Deep copy of original workout for editing
- Discarded on cancel, saved on confirm
- Separate from view mode state

### No Global State Library
- **Why:** MVP doesn't need complex state management
- **Trade-off:** Some prop drilling, but acceptable for MVP size
- **Future:** Could add Zustand/Redux if state becomes complex

### State Flow Example (Active Workout)

```
User selects workout type
  ↓
createWorkout() creates in-memory workout
  ↓
Stored in sessionStorage + React state
  ↓
User edits exercises/sets
  ↓
React state updates → sessionStorage syncs
  ↓
User saves → saveWorkout() → IndexedDB
  ↓
sessionStorage cleared, navigate to home
```

## Persistence

### IndexedDB via Dexie.js
All persisted data is stored in IndexedDB using Dexie.js:

**Database Schema:**
```
RhinoGainsDB (IndexedDB)
├── workouts
│   ├── id (primary key)
│   ├── workout_type
│   ├── started_at
│   └── finished_at
├── exercises
│   ├── id (primary key)
│   ├── workout_id (foreign key)
│   └── name
└── sets
    ├── id (primary key)
    ├── exercise_id (foreign key)
    ├── weight
    └── reps
```

### Data Access Layer
All database operations go through `lib/db.ts`:

- **`createWorkout()`** - Creates in-memory workout (not persisted)
- **`saveWorkout()`** - Persists workout to IndexedDB
- **`getWorkouts()`** - Retrieves all workouts with full details
- **`getWorkoutById()`** - Retrieves single workout with details
- **`updateWorkout()`** - Updates existing workout (transactional)
- **`deleteWorkout()`** - Deletes workout and all related data (cascading)

### Transaction Safety
All write operations use Dexie transactions:
- Ensures atomicity (all or nothing)
- Prevents data corruption
- Handles relationships correctly (workout → exercises → sets)

### Data Relationships
```
Workout (1) ──→ (many) Exercises
Exercise (1) ──→ (many) Sets
```

When loading a workout:
1. Fetch workout from `workouts` table
2. Fetch all exercises where `workout_id` matches
3. For each exercise, fetch all sets where `exercise_id` matches
4. Combine into `WorkoutWithDetails` object

### Temporary State (sessionStorage)
Active workout stored in `sessionStorage`:
- **Why:** Temporary, shouldn't persist
- **Lifecycle:** Created on workout start, cleared on save/discard
- **Benefit:** Survives page refresh but not tab close

## Component Architecture

### Component Hierarchy

```
App (layout.tsx)
└── Page Components
    ├── Home (page.tsx)
    ├── WorkoutSelect (workout/select/page.tsx)
    ├── ActiveWorkout (workout/active/page.tsx)
    │   ├── ExerciseCard (multiple)
    │   │   └── SetInput (multiple)
    │   └── WorkoutActions
    ├── WorkoutDetail (workout/[id]/page.tsx)
    │   ├── ExerciseCard (multiple, read-only or editable)
    │   └── WorkoutActions (conditional)
    └── History (history/page.tsx)
        └── CalendarView (conditional)
```

### Shared Components

**ExerciseCard:**
- Displays exercise with all sets
- Handles exercise name editing
- Manages set additions/deletions
- Reusable for active workout and edit mode

**SetInput:**
- Weight and reps inputs
- Delete set button
- Editable/read-only modes

**WorkoutActions:**
- Fixed bottom action bar
- Save/Discard/Finish buttons
- Used in multiple screens

**CalendarView:**
- Monthly calendar display
- Highlights days with workouts
- Click day to filter workouts

**ConfirmDialog:**
- Reusable confirmation modal
- Customizable messages
- Used for delete/discard confirmations

## Testing Setup

### Playwright Configuration
- **Test directory:** `e2e/`
- **Base URL:** `http://localhost:3000`
- **Browser:** Chromium (can add others)
- **Auto-start dev server:** Yes (via `webServer` config)

### Test Structure
Each test file covers a critical user flow:

1. **`start-save-workout.spec.ts`**
   - Full flow: home → select → log → save → verify

2. **`edit-workout.spec.ts`**
   - Edit past workout → save → verify persistence

3. **`discard-edits.spec.ts`**
   - Edit → make changes → cancel → verify original unchanged

4. **`empty-state.spec.ts`**
   - Fresh app → verify empty state message

### Test Data Management
- **Setup:** Direct IndexedDB manipulation (fast, reliable)
- **Cleanup:** Clear IndexedDB between tests
- **Isolation:** Each test is independent

### Running Tests
```bash
npm run test:e2e        # Run all E2E tests
npm run test:e2e -- --ui  # Run with UI mode
```

## Data Flow Examples

### Creating and Saving a Workout

```
1. User clicks "Start a workout"
   → Navigate to /workout/select

2. User selects "Push"
   → createWorkout("Push") creates workout object
   → Stored in sessionStorage + React state
   → Navigate to /workout/active

3. User fills in exercises/sets
   → React state updates
   → sessionStorage syncs (on each change)

4. User clicks "Save workout"
   → saveWorkout(workout) called
   → Transaction: add workout, exercises, sets to IndexedDB
   → sessionStorage cleared
   → Navigate to /

5. User clicks "Workout history"
   → getWorkouts() called
   → Fetches from IndexedDB
   → Displays in list/calendar view
```

### Editing a Past Workout

```
1. User opens workout from history
   → getWorkoutById(id) called
   → Fetches from IndexedDB
   → Displays in view mode

2. User clicks "Edit"
   → Deep copy workout to editWorkout state
   → Switch to edit mode
   → ExerciseCard components become editable

3. User modifies data
   → editWorkout state updates
   → Original workout unchanged

4. User clicks "Save changes"
   → Confirmation dialog shown
   → User confirms
   → updateWorkout(editWorkout) called
   → Transaction: delete old, add new
   → Reload workout from IndexedDB
   → Switch back to view mode

OR

4. User clicks "Cancel"
   → editWorkout discarded
   → Switch back to view mode
   → Original workout unchanged
```

## Error Handling

### Current Approach
- **Try/catch blocks** around async operations
- **Console.error** for debugging
- **Alert dialogs** for user-facing errors (basic)
- **Graceful degradation** (show loading states)

### Future Improvements
- Error boundaries for React errors
- Better error messages (not just alerts)
- Retry logic for failed operations
- Offline detection and handling

## Performance Considerations

### Current Optimizations
- **Client-side only:** No server round-trips
- **IndexedDB:** Fast local storage
- **Component-level state:** Minimal re-renders
- **No unnecessary data fetching:** Only load what's needed

### Potential Optimizations (Future)
- Virtual scrolling for long workout lists
- Lazy loading of workout details
- IndexedDB query optimization
- Memoization of expensive computations

## Security Considerations

### MVP (Local-Only)
- **No authentication:** Single-user app
- **No network requests:** No XSS/CSRF concerns
- **Client-side validation:** Basic input validation
- **IndexedDB:** Browser sandboxed, secure

### Future (If Adding Backend)
- Authentication required
- API security (CORS, rate limiting)
- Input sanitization
- Data encryption in transit

## Deployment

### Current Setup
- **Static export possible:** Fully client-side
- **No server required:** Can deploy to any static host
- **Environment:** No environment variables needed

### Recommended Hosting
- **Vercel:** Optimal (Next.js creators)
- **Netlify:** Also good for static sites
- **GitHub Pages:** Free, simple
- **Any static host:** Works anywhere

### Build Process
```bash
npm run build    # Creates optimized production build
npm run start    # Serves production build locally
```

## Future Architecture Considerations

### If Adding Backend
- API routes in Next.js (`app/api/`)
- Authentication (NextAuth.js or similar)
- Database (PostgreSQL, MongoDB, etc.)
- API client layer (tRPC, REST, GraphQL)

### If Adding Real-Time Features
- WebSockets or Server-Sent Events
- State synchronization
- Conflict resolution

### If Scaling
- Code splitting
- Route-based lazy loading
- Service workers for offline
- Caching strategies

