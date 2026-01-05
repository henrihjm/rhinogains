# Build Log

This document tracks all changes, additions, and decisions made during the Rhino Gains MVP implementation.

## Initial Setup (2024)

### Project Initialization
**What was added:**
- Next.js 14 project with TypeScript
- Tailwind CSS configuration (black & white theme only)
- Playwright E2E testing setup
- Project structure following Next.js App Router conventions

**Files touched:**
- `package.json` - Dependencies: next, react, react-dom, dexie, tailwindcss, playwright
- `tsconfig.json` - TypeScript configuration with path aliases
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind config with black/white theme
- `postcss.config.js` - PostCSS configuration
- `playwright.config.ts` - Playwright test configuration
- `.eslintrc.json` - ESLint configuration
- `.gitignore` - Git ignore patterns

**Assumptions:**
- Using Next.js App Router (modern approach)
- IndexedDB via Dexie.js for local storage (no backend needed)
- Black & white only design system (per PRD)
- Mobile-first responsive design

**Known limitations:**
- npm install may have permission issues on the system (EPERM errors encountered)
- No authentication or user accounts (single-user MVP)
- No cloud sync or backups
- Data is stored locally only (cleared if browser data is cleared)

---

## Core Types & Database Layer

### Type Definitions
**What was added:**
- TypeScript types for Workout, Exercise, Set, and WorkoutType
- Default exercises for each workout type (Push, Pull, Legs)
- WorkoutWithDetails type for complete workout data

**Files touched:**
- `lib/types.ts` - All type definitions and default exercises

**Default exercises defined:**
- **Push**: Bench Press, Overhead Press, Tricep Dips, Lateral Raises
- **Pull**: Pull-ups, Barbell Rows, Bicep Curls, Face Pulls
- **Legs**: Squats, Deadlifts, Leg Press, Leg Curls

**Assumptions:**
- Each workout type gets 4 default exercises
- Each exercise starts with 3 empty sets
- UUIDs generated client-side using `crypto.randomUUID()`

---

### Database Implementation
**What was added:**
- Dexie database setup with three tables: workouts, exercises, sets
- CRUD functions: createWorkout, saveWorkout, getWorkouts, getWorkoutById, updateWorkout, deleteWorkout
- Transaction-based operations for data consistency

**Files touched:**
- `lib/db.ts` - Complete database layer implementation

**Key functions:**
- `createWorkout()` - Creates in-memory workout with default exercises
- `saveWorkout()` - Persists workout to IndexedDB with finished_at timestamp
- `getWorkouts()` - Retrieves all workouts with full exercise/set details
- `getWorkoutById()` - Retrieves single workout with details
- `updateWorkout()` - Updates existing workout (deletes old, adds new)
- `deleteWorkout()` - Cascading delete of workout, exercises, and sets

**Assumptions:**
- IndexedDB is available (modern browser requirement)
- Database name: "RhinoGainsDB"
- Version 1 schema (no migrations yet)
- Transactions ensure atomicity

**Known limitations:**
- No database migrations (schema changes require manual handling)
- No data export/import functionality
- No backup mechanism
- IndexedDB can be cleared by browser/user

---

## UI Components

### Home Screen
**What was added:**
- Home page with Rhino logo (emoji placeholder), app title
- "Start a workout" primary button
- "Workout history" secondary button
- Black & white minimalist styling

**Files touched:**
- `app/page.tsx` - Home screen implementation
- `app/layout.tsx` - Root layout with metadata
- `app/globals.css` - Global Tailwind styles

**Assumptions:**
- Rhino emoji (🦏) used as logo placeholder (can be replaced with SVG later)
- Large tap targets (min 60px height) for gym usability
- No authentication required (always accessible)

---

### Workout Type Selection
**What was added:**
- Screen with three workout type buttons (Push, Pull, Legs)
- Creates workout in sessionStorage on selection
- Navigation to active workout screen

**Files touched:**
- `app/workout/select/page.tsx` - Workout type selection page

**Assumptions:**
- sessionStorage used for temporary workout state (not persisted)
- Workout created immediately on type selection
- Default exercises initialized automatically

**Known limitations:**
- sessionStorage cleared if tab closed (workout lost if not saved)
- No way to resume interrupted workout sessions

---

### Active Workout Logging
**What was added:**
- Exercise cards with editable names
- Set inputs for weight and reps
- Add/delete set functionality
- Add/delete exercise functionality
- Save, Finish, and Discard workout actions
- Confirmation dialog for discard

**Files touched:**
- `app/workout/active/page.tsx` - Active workout logging screen
- `components/ExerciseCard.tsx` - Exercise display and editing component
- `components/SetInput.tsx` - Weight/reps input component
- `components/WorkoutActions.tsx` - Action buttons component
- `components/ConfirmDialog.tsx` - Reusable confirmation modal

**Assumptions:**
- Active workout stored in sessionStorage (temporary)
- No validation blocking saves (per PRD - allow empty values)
- Weight and reps can be null/empty
- Users can add unlimited exercises and sets

**Known limitations:**
- No exercise templates or presets
- No rest timer or workout duration tracking
- No validation for reasonable weight/rep values
- sessionStorage can be lost on tab close

---

### Workout History
**What was added:**
- Empty state message when no workouts exist
- List view showing all workouts (newest first)
- Calendar view with monthly calendar
- Toggle between list and calendar views
- Click day in calendar to filter workouts
- Navigation to workout detail page

**Files touched:**
- `app/history/page.tsx` - Workout history screen
- `components/CalendarView.tsx` - Calendar component

**Assumptions:**
- Workouts sorted by started_at timestamp (newest first)
- Calendar shows current month by default
- Days with workouts highlighted in black
- Today's date has visual indicator (ring)

**Known limitations:**
- Calendar only shows one month at a time
- No year navigation (only prev/next month)
- No workout count badges on calendar days
- No filtering by workout type

---

### Workout Detail & Edit
**What was added:**
- View mode: Read-only display of workout details
- Edit mode: Full editing capabilities
- Save changes with confirmation dialog
- Cancel edits (discards changes)
- Delete workout with confirmation
- Navigation away auto-discards edits (beforeunload handler)

**Files touched:**
- `app/workout/[id]/page.tsx` - Workout detail and edit page

**Key features:**
- Deep copy of workout for editing (preserves original)
- Edit mode reuses ExerciseCard component
- Workout type and date/time are non-editable
- beforeunload warning if navigating away during edit

**Assumptions:**
- Users should confirm before saving edits (overwrites original)
- Canceling edits restores original data
- Delete requires confirmation (destructive action)
- Navigation away during edit discards changes

**Known limitations:**
- No edit history or undo functionality
- No way to duplicate a workout
- No way to change workout type after creation
- beforeunload may not work in all browsers/situations

---

## Shared Components

### ExerciseCard
**What was added:**
- Displays exercise name (editable in edit mode)
- Renders all sets with SetInput components
- Add set button
- Delete exercise button (optional)
- Handles exercise name updates
- Handles set updates and deletions

**Files touched:**
- `components/ExerciseCard.tsx`

**Assumptions:**
- Exercise names can be empty (user can fill in)
- Sets can be added/removed dynamically
- Component is reusable for both active and edit modes

---

### SetInput
**What was added:**
- Weight input (number)
- Reps input (number)
- Delete set button
- Editable/read-only modes

**Files touched:**
- `components/SetInput.tsx`

**Assumptions:**
- Weight and reps can be null/empty
- Number inputs allow decimal values for weight
- Reps are integers only
- Delete button only shown in editable mode

---

### WorkoutActions
**What was added:**
- Fixed bottom action bar
- Finish workout button (optional)
- Save workout/Save changes button
- Discard workout/Cancel button
- Responsive button layout

**Files touched:**
- `components/WorkoutActions.tsx`

**Assumptions:**
- Actions always visible at bottom (fixed position)
- Finish and Save are separate actions (per PRD)
- Buttons have minimum 60px height for gym usability

---

### CalendarView
**What was added:**
- Monthly calendar display
- Previous/next month navigation
- Day highlighting for days with workouts
- Today indicator
- Click day to filter workouts

**Files touched:**
- `components/CalendarView.tsx`

**Assumptions:**
- Calendar shows current month by default
- Days with workouts are black background
- Days without workouts are white with black border
- Today has ring indicator

**Known limitations:**
- No year navigation (only month-by-month)
- No week view option
- No workout count on calendar days

---

### ConfirmDialog
**What was added:**
- Reusable confirmation modal
- Customizable title, message, and button text
- Black & white styling matching app theme

**Files touched:**
- `components/ConfirmDialog.tsx`

**Assumptions:**
- Modal overlay blocks interaction
- Confirmation required for destructive actions
- Cancel is default action (left button)

---

## E2E Tests

### Test Suite Setup
**What was added:**
- Playwright configuration
- Four test suites covering critical user flows
- Test data setup and cleanup

**Files touched:**
- `playwright.config.ts` - Playwright configuration
- `e2e/start-save-workout.spec.ts` - Start and save workout flow
- `e2e/edit-workout.spec.ts` - Edit past workout flow
- `e2e/discard-edits.spec.ts` - Discard edits safely
- `e2e/empty-state.spec.ts` - Empty state handling

**Test coverage:**
1. **Start and save workout**: Full flow from home → select type → log exercise → save → verify in history
2. **Edit past workout**: Open workout → edit mode → modify data → save → verify persistence
3. **Discard edits safely**: Edit mode → make changes → cancel → verify original unchanged
4. **Empty state**: Fresh app → verify history shows empty state message

**Assumptions:**
- Tests run against localhost:3000
- Dev server started automatically by Playwright
- IndexedDB cleared between tests for isolation
- Tests use UI interactions (not direct database calls where possible)

**Known limitations:**
- Tests may be flaky if IndexedDB operations are slow
- Some tests use direct database manipulation for setup (not ideal but necessary)
- No visual regression testing
- No performance testing

---

## Styling & Design System

**What was added:**
- Black (#000) and white (#fff) color scheme only
- Large tap targets (minimum 44px, typically 60px)
- High contrast text
- Mobile-first responsive design
- Minimalist, utilitarian aesthetic

**Files touched:**
- `tailwind.config.ts` - Theme configuration
- `app/globals.css` - Global styles
- All component files - Inline Tailwind classes

**Design principles:**
- One primary action per screen
- Fast logging during workouts
- Low cognitive load
- Easy to discard mistakes
- Readable in low-focus gym conditions

**Assumptions:**
- Black buttons for primary actions
- White buttons with black border for secondary actions
- Fixed bottom action bars for workout screens
- Consistent spacing and typography

---

## TODOs & Future Improvements

### High Priority
- [ ] Replace emoji rhino with proper SVG logo
- [ ] Add data export functionality (JSON backup)
- [ ] Improve E2E test reliability (better selectors, wait strategies)
- [ ] Add error boundaries for better error handling
- [ ] Add loading states for async operations

### Medium Priority
- [ ] Add workout templates/presets
- [ ] Add rest timer functionality
- [ ] Add workout duration tracking
- [ ] Improve calendar view (year navigation, workout counts)
- [ ] Add filtering by workout type in history
- [ ] Add ability to duplicate workouts

### Low Priority
- [ ] Add dark mode (if expanding beyond black/white)
- [ ] Add exercise search/autocomplete
- [ ] Add workout statistics/analytics
- [ ] Add data import functionality
- [ ] Add PWA support for offline use
- [ ] Add workout sharing (if adding social features)

### Technical Debt
- [ ] Add database migrations for schema changes
- [ ] Improve error handling and user feedback
- [ ] Add input validation (with warnings, not blocking)
- [ ] Optimize IndexedDB queries for large datasets
- [ ] Add unit tests for utility functions
- [ ] Improve TypeScript strictness

---

## Notes

- All components are client-side ("use client") due to Next.js App Router requirements
- sessionStorage used for active workout (temporary, not persisted)
- IndexedDB used for all persisted data
- No server-side rendering needed (fully client-side app)
- No API routes required (local-only app)

