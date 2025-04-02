# GoatedVips System Patterns

## System Architecture

GoatedVips follows a modern web application architecture with clear separation of concerns:

```mermaid
graph TD
    Client[Client-Side React App] <--> API[Server-Side API]
    API <--> DB[Database]
    API <--> ExternalAPI[Goated.com API]
    
    subgraph "Frontend"
        Client
    end
    
    subgraph "Backend"
        API
        DB
    end
    
    subgraph "External Systems"
        ExternalAPI
    end
```

### Frontend Architecture
- Single-page application (SPA) built with React
- Component-based UI structure with reusable elements
- State management with React hooks
- Client-side routing with React Router
- API client for backend communication

### Backend Architecture
- Node.js server with Express.js framework
- RESTful API endpoints for client communication
- Service-oriented structure with separation of concerns
- Database access through abstraction layers

## Design Patterns

### API Integration Pattern
For Goated.com API integration, we use a secure token-based approach:

```mermaid
sequenceDiagram
    participant Client
    participant APIService
    participant TokenManager
    participant GoatedAPI
    
    Client->>APIService: Request data
    APIService->>TokenManager: Get API token
    TokenManager-->>APIService: Return valid token
    APIService->>GoatedAPI: Make authenticated request
    GoatedAPI-->>APIService: Return response
    APIService-->>Client: Return processed data
```

- API tokens are securely stored and managed
- Token rotation and expiration handling
- Centralized API utility functions
- Error handling and retry mechanisms

### User Account Linking Pattern
For connecting user accounts between GoatedVips and Goated.com:

```mermaid
graph TD
    Register[User Registration] --> LocalAccount[Create Local Account]
    LocalAccount --> LinkOption[Show Linking Option]
    LinkOption --> LinkProcess[Link with Goated ID]
    LinkProcess --> Verification[Verify Goated Account]
    Verification --> LinkedAccount[Fully Linked Account]
    
    subgraph "Temporary State"
        TempAccount[Temporary Account]
    end
    
    GoatedID[Goated ID Entry] --> LookupUser[Look Up User]
    LookupUser --> ExistingCheck{User Exists?}
    ExistingCheck -->|Yes| ExistingAccount[Use Existing Account]
    ExistingCheck -->|No| TempAccount
    TempAccount -.-> LinkProcess
```

- Support for direct registration and Goated ID-based accounts
- Verification process to confirm Goated.com account ownership
- Temporary account handling for unverified users
- Account merging for users with multiple identities

### Data Synchronization Pattern
For maintaining consistent data with Goated.com:

```mermaid
sequenceDiagram
    participant CronJob
    participant SyncService
    participant UserService
    participant GoatedAPI
    participant Database
    
    CronJob->>SyncService: Trigger sync
    SyncService->>GoatedAPI: Fetch leaderboard data
    GoatedAPI-->>SyncService: Return user data
    
    loop For each user
        SyncService->>UserService: Process user
        UserService->>Database: Check if exists
        Database-->>UserService: User exists/not exists
        
        alt User exists
            UserService->>Database: Update user data
        else User doesn't exist
            UserService->>Database: Create new user
        end
    end
    
    SyncService-->>CronJob: Sync complete
```

- Periodic synchronization of user data from Goated.com
- Differential updates to avoid unnecessary database operations
- Conflict resolution strategies
- Logging and monitoring of sync operations

## Data Flow Patterns

### API Request Flow

```mermaid
graph LR
    Request[Client Request] --> Middleware[Auth Middleware]
    Middleware --> RouteHandler[Route Handler]
    RouteHandler --> Controller[Controller]
    Controller --> Service[Service]
    Service --> Database[Database] & ExternalAPI[External API]
    Database & ExternalAPI --> Service
    Service --> Controller
    Controller --> Response[Response]
```

- Consistent middleware approach for authentication and validation
- Separation of route handlers from business logic
- Service layer for business rules and data access
- Consistent error handling and response formatting
