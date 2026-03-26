# Copilot Instructions for Restaurant Management System

## Architecture Overview

This is a full-stack restaurant management system with:
- **Backend**: Spring Boot 3.5 (Java 21) REST API with PostgreSQL
- **Frontend**: React + TypeScript (Vite) with shadcn UI components  
- **Auth**: JWT-based authentication with refresh token rotation
- **Data**: Liquibase migrations, MapStruct DTOs, entity-driven design

### Key Components
- **backend/**: Spring Boot application (port 8080)
  - `RestaurantManagementApplication.java` - Entry point with scheduling enabled
  - `controller/` - REST endpoints (Auth, Branch, Restaurant)
  - `services/` - Business logic and JWT handling
  - `entities/` - JPA entities (40+ domain models including Order, Reservation, MenuItem, etc.)
  - `mapper/` - MapStruct interfaces for DTO conversion
  - `repositories/` - Spring Data JPA interfaces
  - `security/` - `JwtAuthenticationFilter` for request filtering
  - `config/` - `SecurityConfig` (stateless JWT), `JwtProperties` for expiration
  - `dto/request/response/` - Input/output contracts

- **frontend/**: React application (port 5173)
  - `pages/` - Index, Login, NotFound
  - `components/` - Navbar, NavLink, 40+ shadcn UI components
  - `api/` - `axiosClient.ts` (interceptors, token refresh)
  - `stores/` - `authStore.ts` (Zustand with persistence)
  - `hooks/` - Custom React hooks including toast and mobile detection
  - `types/` - TypeScript DTOs matching backend contracts

## Critical Workflows

### Backend Build & Run
```bash
cd backend
./mvnw clean package  # Maven wrapper, compile with MapStruct processors
./mvnw spring-boot:run  # Runs on 8080, requires DB_URL, DB_USER, DB_PASSWORD env vars
./mvnw test  # Runs tests (spring-boot-starter-test, spring-security-test)
```

### Frontend Build & Run
```bash
cd frontend
bun install  # Uses Bun package manager, check bun.lockb
bun run dev  # Vite dev server on 5173, connects to VITE_API_BASE_URL env var
bun run build  # Production build
bun run lint  # ESLint check
bun run test  # Vitest
```

### Database Migrations
- Liquibase XML/YAML in `backend/src/main/resources/db/changelog/db.changelog-master.yaml`
- Maven plugin configured in pom.xml; requires DB environment variables
- Controlled via `spring.liquibase.enabled: false` in application.yml (managed separately)

## Key Patterns & Conventions

### Backend DTO Pattern (MapStruct)
```java
// Backend uses @Mapper(componentModel = "spring") interfaces
@Mapper(componentModel = "spring")
public interface RestaurantMapper {
    @Mapping(source = "user.userId", target = "userId")  // Nested mapping
    RestaurantDTO toRestaurantDto(Restaurant restaurant);
    
    @Mapping(source = "userId", target = "user.userId")
    Restaurant toRestaurant(RestaurantDTO dto);
}
```
- Mappers are component-scanned and injected as Spring beans
- Use `@Mapping` for non-trivial field transformations
- Lombok + MapStruct binding configured for annotation processing

### Authentication Flow
```
Frontend Login → AuthenticationController.login() → AuthenticationService
  ↓
Validates credentials, creates JWT + Refresh tokens → AuthenticationResponse
  ↓
Zustand authStore persists (localStorage): accessToken, refreshToken, user
  ↓
axiosClient.interceptors.request adds "Authorization: Bearer {accessToken}"
  ↓
JwtAuthenticationFilter validates JWT in all requests (stateless SessionCreationPolicy)
  ↓
If 401, axiosClient.interceptors.response auto-refreshes via /api/auth/refresh
```
- JWT expiration: access token 1 hour, refresh token 7 days
- Stateless sessions; CORS enabled from SecurityConfig
- Token refresh queuing prevents race conditions (see axiosClient failedQueue)

### REST API Response Format
```java
// All responses use generic ApiResponse wrapper
public class ApiResponse<T> {
    private int code;        // HTTP-like status codes
    private String message;  // Human-readable message
    private T result;        // Generic payload
}
// Example: `{ "code": 200, "message": "Login successful", "result": {...} }`
```

### Entity Design
- Entities use Lombok (`@Data`, `@RequiredArgsConstructor`) to reduce boilerplate
- Relationships: Restaurant → Branch → Area → AreaTable → Order
- Composite entities: BranchMenuItem, OrderItem, OrderItemCustomization
- Status enums for Order, Reservation, Subscription, Table tracking state machines
- Audit fields implied (user, timestamps) via JPA lifecycle if present

### Frontend Component Structure
- shadcn UI provides Radix UI primitives with Tailwind styling
- Form validation via `@hookform/resolvers` (Zod/Yup integration ready)
- React Query for API caching with 5-minute stale time default
- useAuthStore for global auth state; check `isAuthenticated()` before rendering protected routes
- Custom hooks in `hooks/` for mobile detection, toast notifications

### Error Handling
- Backend: @RestControllerAdvice pattern (check `exception/` folder for GlobalExceptionHandler if present)
- Frontend: axiosClient interceptors catch 401/403; navigate to /login on auth failure
- Validation: Backend uses `@Valid` + `spring-boot-starter-validation`; Frontend uses hook-form

## External Dependencies & Integrations

- **PostgreSQL**: Required at runtime; credentials via env vars (DB_URL, DB_USER, DB_PASSWORD)
- **Cloudinary**: Image uploading (version 1.33.0 configured); requires API credentials in SecurityConfig or services
- **Spring Security + JWT**: No external auth provider (Keycloak, Auth0); self-managed tokens
- **OAuth2 Resource Server**: starter included; check if bearer token validation needed beyond JWT filter
- **Liquibase**: Database versioning; migrations tracked in changelog files

## Environment Setup

### Required Env Variables
```
# Backend
DB_URL=jdbc:postgresql://localhost:5432/restaurant_db
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET_KEY=your-secret-key-min-32-chars

# Frontend
VITE_API_BASE_URL=http://localhost:8080
```

### IDE/Local Setup
- Backend: JDK 21, Maven (mvnw provided)
- Frontend: Node 18+ or Bun package manager (bun.lockb committed)
- Database: PostgreSQL 12+
- No Docker config detected; local setup only currently

## Code Generation & Tooling

- MapStruct annotation processor generates mapper implementations at compile time (see pom.xml annotationProcessorPaths)
- Lombok generates constructors, getters, setters, toString() (annotation processing included)
- Vitest configured for frontend unit tests; see test/ folder structure
- ESLint configured (eslint.config.js); run `bun run lint` before commits

## Testing Strategy

- Backend: JUnit 5 (spring-boot-starter-test), Security tests available (spring-security-test)
- Frontend: Vitest with setup.ts configuration; tests co-located in src/test/
- No E2E framework detected; consider Cypress/Playwright for cross-stack testing
- Query caching staleTime: 5 minutes; set refetchOnWindowFocus: false for stable tests

## Important Notes for AI Agents

1. **When adding entities**: Update both backend mapper (MapStruct interface) and frontend DTO types in `types/dto/`
2. **API contract changes**: Modify ApiResponse structure carefully; regenerate frontend types and axiosClient interceptors
3. **Authentication failures**: Check JWT expiration times (1h access, 7d refresh) and token refresh endpoint signature
4. **Database schema changes**: Always create Liquibase changelog files; manually run migrations during development
5. **Component imports**: Use `@/` path alias in frontend (configured in vite.config.ts and tsconfig.json)
6. **State management**: Prefer Zustand stores for global state; React Query for server state; local useState for UI-only state
7. **Styling**: Use Tailwind + shadcn UI; avoid custom CSS unless necessary (see tailwind.config.ts)
8. **Build consistency**: MapStruct and Lombok must be processed together; incorrect annotationProcessorPaths order breaks builds
