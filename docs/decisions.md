# Architecture Decisions

This document explains the "why" behind key technical decisions made during the Rhino Gains MVP implementation.

## Technology Stack

### Next.js 14 with App Router
**Why:** 
- Modern React framework with excellent developer experience
- App Router provides file-based routing (simpler than manual route configuration)
- Built-in TypeScript support
- Good performance out of the box
- Easy deployment options (Vercel, but also works elsewhere)

**Alternatives considered:**
- Plain React + Vite: More setup required, no built-in routing
- Remix: Similar but less mature ecosystem
- SvelteKit: Different paradigm, team familiarity with React

### TypeScript
**Why:**
- Type safety catches errors at compile time
- Better IDE autocomplete and refactoring
- Self-documenting code (types explain data structures)
- Essential for maintaining code quality as app grows

**Alternatives considered:**
- JavaScript: Less type safety, more runtime errors
- Flow: Less popular, smaller ecosystem

### Dexie.js for IndexedDB
**Why:**
- IndexedDB is the standard browser storage for structured data
- Dexie provides a clean Promise-based API (IndexedDB is callback-based)
- Supports transactions and relationships
- Better developer experience than raw IndexedDB
- No external dependencies (browser-native)

**Alternatives considered:**
- localStorage: Only key-value, no structured queries
- SQL.js: Heavier, requires WASM, overkill for MVP
- PouchDB: Adds sync complexity we don't need
- Backend database: Adds infrastructure complexity, not needed for MVP

### Tailwind CSS
**Why:**
- Utility-first approach fits minimalist design
- Easy to enforce black/white theme (just don't use other colors)
- Fast development (no custom CSS files needed)
- Consistent spacing and sizing
- Mobile-first responsive design built-in

**Alternatives considered:**
- CSS Modules: More verbose, harder to maintain consistency
- Styled Components: Adds runtime overhead, not needed for static styles
- Plain CSS: More boilerplate, harder to maintain

### Playwright for E2E Testing
**Why:**
- Modern, fast, and reliable
- Better than Cypress for Next.js apps (handles routing better)
- Good TypeScript support
- Can test multiple browsers
- Better debugging tools than Selenium

**Alternatives considered:**
- Cypress: Good but can have issues with Next.js routing
- Selenium: Older, slower, more complex setup
- Testing Library: Unit/integration only, not E2E

## Architecture Patterns

### Client-Side Only
**Why:**
- MVP requirement: local-only, no backend
- Simpler deployment (static hosting possible)
- Faster development (no API to build)
- Works offline (once loaded)
- No server costs

**Trade-offs:**
- No server-side rendering (but not needed for MVP)
- No API routes (but not needed for local-only)
- Data stored in browser (can be cleared)

### sessionStorage for Active Workout
**Why:**
- Temporary state that shouldn't persist
- Automatically cleared on tab close (prevents stale data)
- Faster than IndexedDB for temporary data
- Separate from persisted workouts

**Alternatives considered:**
- IndexedDB: Would persist incomplete workouts
- React state only: Lost on refresh (bad UX)
- localStorage: Persists too long, needs manual cleanup

### Component Reusability
**Why:**
- ExerciseCard used in both active workout and edit mode
- Reduces code duplication
- Consistent UI/UX across screens
- Easier to maintain (one place to fix bugs)

**Trade-offs:**
- Slightly more complex props (editable flag)
- But worth it for consistency

### Deep Copy for Edit Mode
**Why:**
- Preserves original data if user cancels
- Can discard changes safely
- Clear separation between view and edit state

**Alternatives considered:**
- Mutate original: Can't cancel edits properly
- Shallow copy: Nested objects (exercises, sets) would still reference originals

### Confirmation Dialogs for Destructive Actions
**Why:**
- Prevents accidental data loss
- User explicitly confirms delete/discard
- Good UX practice for destructive actions

**Alternatives considered:**
- No confirmation: Too risky, users make mistakes
- Undo pattern: More complex, not needed for MVP

## Data Model Decisions

### Separate Tables for Workouts, Exercises, Sets
**Why:**
- Normalized database structure
- Easy to query workouts with all details
- Supports future features (e.g., exercise library)
- Clear relationships (workout → exercises → sets)

**Alternatives considered:**
- Single JSON blob: Harder to query, no relationships
- Embedded documents: Less flexible

### UUIDs for IDs
**Why:**
- Client-side generation (no server needed)
- Globally unique (no collisions)
- Can generate offline
- Standard practice for distributed systems

**Alternatives considered:**
- Auto-increment: Requires server/centralized counter
- Timestamps: Can collide if created simultaneously

### Nullable Weight and Reps
**Why:**
- Users may not fill in all sets immediately
- Allows partial logging (per PRD: no validation blocking)
- Flexible for different logging styles

**Alternatives considered:**
- Default to 0: Misleading (0 reps vs not logged)
- Required fields: Too strict, blocks saving

### Default Exercises Per Workout Type
**Why:**
- Faster workout logging (pre-filled exercises)
- Common exercises for each split
- Users can still add/remove exercises
- Good starting point

**Alternatives considered:**
- Empty workouts: More friction, users have to add everything
- User-defined templates: More complex, not needed for MVP

## UI/UX Decisions

### Fixed Bottom Action Bar
**Why:**
- Always accessible (no scrolling to find buttons)
- Large tap targets (gym-friendly)
- Clear primary actions
- Mobile-first design

**Alternatives considered:**
- Top bar: Harder to reach on mobile
- Floating button: Can be missed

### Black & White Only
**Why:**
- PRD requirement
- High contrast (readable in gym)
- Minimalist aesthetic
- No color decisions needed

**Alternatives considered:**
- Color scheme: Not needed for MVP, adds complexity

### Large Tap Targets (60px minimum)
**Why:**
- Gym environment (sweaty hands, low focus)
- Mobile usability best practice (44px minimum)
- Easier to tap accurately
- Better accessibility

**Alternatives considered:**
- Smaller buttons: Harder to use in gym
- Variable sizes: Inconsistent UX

### Calendar View for History
**Why:**
- Visual representation of workout frequency
- Easy to see patterns (which days worked out)
- Familiar UI pattern
- Good for motivation (see progress)

**Alternatives considered:**
- List only: Less visual, harder to see patterns
- Graph view: More complex, not needed for MVP

### Edit Mode Separate from View Mode
**Why:**
- Clear state (editing vs viewing)
- Can cancel edits safely
- Prevents accidental changes
- Better UX (explicit edit action)

**Alternatives considered:**
- Always editable: Too easy to make mistakes
- Inline editing: Less clear state

## Testing Decisions

### E2E Tests Only (No Unit Tests)
**Why:**
- MVP focus: test user flows, not implementation
- E2E tests catch integration issues
- Faster to write (fewer tests needed)
- Tests what users actually do

**Alternatives considered:**
- Unit tests: More tests, more maintenance, less value for MVP
- Integration tests: Similar to E2E, but E2E is more comprehensive

### Direct Database Manipulation in Tests
**Why:**
- Faster test setup (don't need to click through UI)
- More reliable (no UI flakiness)
- Can test edge cases easily

**Trade-offs:**
- Not testing full user flow for setup
- But acceptable for MVP (tests still verify user actions)

### Test Isolation (Clear DB Between Tests)
**Why:**
- Tests don't affect each other
- Predictable test results
- Can run tests in any order

**Alternatives considered:**
- Shared state: Faster but flaky
- Test data cleanup: More complex, same result

## Future Considerations

### Why Not Add Now (But Might Later)

**Authentication:**
- MVP is single-user, no need
- Would add complexity (backend, sessions, etc.)
- Can add later if needed

**Cloud Sync:**
- MVP is local-only
- Would require backend infrastructure
- Can add later if needed

**Advanced Analytics:**
- MVP focuses on logging, not analysis
- Can add later when there's data to analyze
- Keep MVP simple

**Exercise Library:**
- Default exercises are enough for MVP
- Can add search/autocomplete later
- Don't over-engineer

**Workout Templates:**
- Users can create their own by saving workouts
- Templates would be nice-to-have, not essential
- Can add later

