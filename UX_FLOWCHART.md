# HackerDen UX Flowchart

## Complete User Experience Flow

This document provides a detailed flowchart of the HackerDen user experience, covering all user journeys from initial registration through advanced enhancement features.

## 🎯 User Entry Points

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENTRY POINTS                             │
├─────────────────────────────────────────────────────────────────┤
│ 1. Direct URL Access → Landing Page                             │
│ 2. Hackathon Organizer Invitation → Registration               │
│ 3. Team Member Invitation → Join Team Flow                     │
│ 4. Judge Access → Public Submission Page                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow (OAuth Only)

```mermaid
graph TD
    A[User Visits HackerDen] --> B{Authenticated?}
    B -->|No| C[Redirect to /login]
    B -->|Yes| D[Redirect to /console]
    
    C --> E[Login Page]
    E --> F[GitHub OAuth Button]
    E --> G[Google OAuth Button]
    
    F --> H[GitHub OAuth Flow]
    G --> I[Google OAuth Flow]
    
    H --> J[OAuth Callback]
    I --> J
    J --> K[Account Created/Logged In]
    K --> D
    
    style E fill:#e1f5fe
    style F fill:#f3e5f5
    style G fill:#f3e5f5
    style H fill:#e8f5e8
    style I fill:#e8f5e8
```

## 🏠 Main Console Flow

```mermaid
graph TD
    A[User Console /console] --> B[Load User Hackathons]
    B --> C{Has Hackathons?}
    
    C -->|No| D[Empty State]
    D --> E[Create First Hackathon]
    D --> F[Join Existing Hackathon]
    
    C -->|Yes| G[Display Hackathon Cards]
    G --> H[Ongoing Hackathons]
    G --> I[Upcoming Hackathons]
    G --> J[Completed Hackathons]
    
    H --> K[Click Hackathon Card]
    I --> K
    J --> K
    
    K --> L[Load Hackathon Dashboard]
    L --> M{User Has Team?}
    
    M -->|No| N[Team Selection]
    M -->|Yes| O[Hackathon Dashboard]
    
    E --> P[Hackathon Creation Form]
    P --> Q[Fill Details]
    Q --> R[Create Hackathon]
    R --> L
    
    F --> S[Enter Join Code]
    S --> T[Validate Code]
    T -->|Invalid| U[Show Error]
    T -->|Valid| V[Join Hackathon]
    V --> L
    
    U --> S
```

## 👥 Team Management Flow

```mermaid
graph TD
    A[Team Selection Screen] --> B{Action Choice}
    
    B --> C[Create New Team]
    B --> D[Join Existing Team]
    
    C --> E[Team Creation Form]
    E --> F[Enter Team Name]
    F --> G[Validate Name]
    G -->|Invalid| H[Show Error]
    G -->|Valid| I[Generate Join Code]
    I --> J[Create Team]
    J --> K[User Becomes Team Leader]
    K --> L[Redirect to Dashboard]
    
    D --> M[Enter Join Code]
    M --> N[Validate Code]
    N -->|Invalid| O[Show Error]
    N -->|Valid| P[Check Duplicate]
    P -->|Already Member| Q[Show Warning]
    P -->|New Member| R[Join Team]
    R --> S[User Becomes Team Member]
    S --> L
    
    H --> E
    O --> M
    Q --> M
    
    L --> T[Team Dashboard]
    T --> U{User Role?}
    U -->|Member| V[Leave Team Option]
    U -->|Leader/Owner| W[Delete Team Option]
    
    V --> X[Confirm Leave Team]
    X -->|Yes| Y[Remove from Team]
    X -->|No| T
    
    W --> Z[Double Confirmation]
    Z -->|Yes| AA[Delete ALL Team Data]
    Z -->|No| T
    
    AA --> BB[Delete Tasks]
    AA --> CC[Delete Messages]
    AA --> DD[Delete Files]
    AA --> EE[Delete Documents]
    AA --> FF[Delete Vault Secrets]
    AA --> GG[Delete Team Members]
    AA --> HH[Delete Team Record]
    
    BB --> II[Complete Deletion]
    CC --> II
    DD --> II
    EE --> II
    FF --> II
    GG --> II
    HH --> II
    II --> JJ[Return to Console]
    
    Y --> JJ
```

## 📋 Task Management Flow

```mermaid
graph TD
    A[Kanban Board] --> B[Four Columns Display]
    B --> C[To-Do Column]
    B --> D[In Progress Column]
    B --> E[Blocked Column]
    B --> F[Done Column]
    
    G[Create Task Button] --> H[Task Modal Opens]
    H --> I[Fill Task Form]
    I --> J[Title Required]
    I --> K[Description Required]
    I --> L[Priority Selection]
    I --> M[Assignment Selection]
    
    M --> N{User Role?}
    N -->|Team Leader| O[Can Assign to Anyone]
    N -->|Team Member| P[Can Only Assign to Self]
    
    J --> Q[Form Validation]
    K --> Q
    L --> Q
    O --> Q
    P --> Q
    
    Q -->|Invalid| R[Show Validation Errors]
    Q -->|Valid| S[Create Task]
    S --> T[Real-time Update]
    T --> U[Task Appears in To-Do]
    
    V[Click Task Card] --> W[Task Actions Menu]
    W --> X[Edit Task]
    W --> Y[Delete Task]
    W --> Z[View Details]
    
    X --> AA[Edit Task Modal]
    AA --> I
    
    Y --> BB[Confirmation Dialog]
    BB -->|Cancel| W
    BB -->|Confirm| CC[Delete Task]
    CC --> T
    
    DD[Drag Task] --> EE[Visual Feedback]
    EE --> FF[Drop in New Column]
    FF --> GG[Update Task Status]
    GG --> T
    
    R --> H
```

## 💬 Chat System Flow

```mermaid
graph TD
    A[Chat Interface] --> B[Message List Display]
    B --> C[Load Team Messages]
    C --> D[Real-time Subscription]
    
    E[Message Input] --> F[Type Message]
    F --> G[Press Enter / Click Send]
    G --> H[Validate Message]
    H -->|Empty| I[Prevent Send]
    H -->|Valid| J[Optimistic Update]
    J --> K[Send to Server]
    K -->|Success| L[Confirm Message]
    K -->|Error| M[Show Error + Retry]
    
    L --> N[Real-time Broadcast]
    N --> O[Update All Team Members]
    
    P[System Messages] --> Q[Task Created]
    P --> R[Task Status Changed]
    P --> S[Team Member Joined]
    P --> T[File Uploaded]
    
    Q --> U[Auto-generate Message]
    R --> U
    S --> U
    T --> U
    U --> N
    
    V[Bot Messages] --> W[Motivational Messages]
    V --> X[Contextual Tips]
    V --> Y[Easter Eggs]
    
    W --> Z[Send to Chat]
    X --> Z
    Y --> Z
    Z --> N
    
    I --> F
    M --> F
```

## 📁 File Sharing Flow

```mermaid
graph TD
    A[File Library] --> B[Display File Grid]
    
    B --> C[Upload Button]
    C --> D[File Selection Dialog]
    D --> E[Select Files]
    E --> F[File Validation]
    
    F --> G[Check File Type]
    F --> H[Check File Size]
    G -->|Invalid Type| I[Show Type Error]
    H -->|Too Large| J[Show Size Error]
    G -->|Valid Type| K[Validation Passed]
    H -->|Valid Size| K
    
    K --> L[Upload Progress]
    L --> M[Generate Preview]
    M --> N[Save to Storage]
    N -->|Success| O[Add to File Library]
    N -->|Error| P[Show Upload Error]
    
    O --> Q[Real-time Update]
    Q --> R[Notify Team Members]
    
    S[Click File Card] --> T[File Actions Menu]
    T --> U[Preview File]
    T --> V[Download File]
    T --> W[Edit File Name]
    T --> X[Delete File]
    
    U --> Y[Open in New Tab]
    V --> Z[Download to Device]
    
    W --> AA[Edit Name Dialog]
    AA --> BB[Enter New Name]
    BB --> CC[Save Changes]
    CC --> DD[Update File Record]
    DD --> Q
    
    X --> EE[Confirm Deletion]
    EE -->|Yes| FF[Delete from Storage]
    EE -->|No| T
    FF --> GG[Delete File Record]
    GG --> Q
    
    I --> D
    J --> D
    P --> D
```

## 💡 Idea Management Flow

**REMOVED FOR FINAL SUBMISSION** - This feature has been simplified out of the application to focus on core hackathon functionality.

## 🎮 Gamification Flow

**REMOVED FOR FINAL SUBMISSION** - This feature has been simplified out of the application to focus on core hackathon functionality.

## 📊 Polling System Flow

**REMOVED FOR FINAL SUBMISSION** - This feature has been simplified out of the application to focus on core hackathon functionality.

## 🏆 Judge Submission Flow

```mermaid
graph TD
    A[Submission Builder] --> B{Feature Enabled?}
    B -->|No| C[Feature Disabled Message]
    B -->|Yes| D[Submission Form]
    
    D --> E[Project Information]
    E --> F[Project Title]
    E --> G[Project Description]
    E --> H[Tech Stack Selection]
    
    I[Team Contributions] --> J[Auto-populate from Tasks]
    I --> K[Manual Contribution Entry]
    I --> L[Role Assignments]
    
    M[Project Links] --> N[Demo URL]
    M --> O[Repository URL]
    M --> P[Additional Links]
    
    Q[Challenges & Accomplishments] --> R[Challenges Faced]
    Q --> S[Key Accomplishments]
    Q --> T[Future Work Plans]
    
    F --> U[Auto-save Form Data]
    G --> U
    H --> U
    J --> U
    K --> U
    L --> U
    N --> U
    O --> U
    P --> U
    R --> U
    S --> U
    T --> U
    
    U --> V[Local Storage Backup]
    V --> W[Periodic Save to Server]
    
    X[Preview Submission] --> Y[Public Page Preview]
    Y --> Z[Judge-friendly Layout]
    Z --> AA[No Authentication Required]
    Z --> BB[Clean Professional Design]
    Z --> CC[Export Options]
    
    DD[Finalize Submission] --> EE[Confirmation Dialog]
    EE -->|Cancel| D
    EE -->|Confirm| FF[Lock Submission]
    FF --> GG[Generate Public URL]
    GG --> HH[Share with Judges]
    
    II[Public Submission Page] --> JJ[Judge Access]
    JJ --> KK[View Project Details]
    KK --> LL[Team Information]
    KK --> MM[Technical Details]
    KK --> NN[Demo Links]
    KK --> OO[Evaluation Criteria]
```

## 🧭 Navigation Flow (Simplified)

```mermaid
graph TD
    A[Hackathon Dashboard] --> B[Sidebar Navigation]
    
    B --> C[Overview Section]
    C --> D[Dashboard - Main Overview]
    
    B --> E[Project Management Section]
    E --> F[Tasks - Kanban Board]
    E --> G[Documents - Collaborative Docs]
    E --> H[Files - File Library]
    
    B --> I[Collaboration Section]
    I --> J[Chat - Team Communication]
    I --> K[Whiteboard - Visual Collaboration]
    I --> L[Team Vault - Secure Storage]
    
    B --> M[Submission Section]
    M --> N[Submission - Judge Presentation]
    
    O[Progress Tracking] --> P[Task Progress Bar]
    P --> Q[Completed vs Total Tasks]
    Q --> R[Visual Progress Indicator]
    
    S[Team Actions] --> T{User Role?}
    T -->|Member| U[Leave Team Option]
    T -->|Leader/Owner| V[Delete Team Option]
    
    U --> W[Confirm Leave Team]
    V --> X[Double Confirmation Delete]
    X --> Y[Delete ALL Team Data]
    
    style C fill:#e1f5fe
    style E fill:#f3e5f5
    style I fill:#e8f5e8
    style M fill:#fff3e0
```

## 🤖 Bot System & Easter Eggs Flow

```mermaid
graph TD
    A[Bot System] --> B{Feature Enabled?}
    B -->|No| C[Feature Disabled Message]
    B -->|Yes| D[Monitor Team Activity]
    
    D --> E[Activity Pattern Analysis]
    E --> F[Long Inactivity Detected]
    E --> G[High Activity Detected]
    E --> H[Milestone Reached]
    E --> I[Special Date/Time]
    
    F --> J[Motivational Message]
    G --> K[Productivity Tip]
    H --> L[Celebration Message]
    I --> M[Themed Decoration]
    
    J --> N[Send Bot Message]
    K --> N
    L --> N
    M --> N
    
    N --> O[Chat Integration]
    O --> P[Real-time Delivery]
    
    Q[Easter Egg Commands] --> R[/party Command]
    Q --> S[/celebrate Command]
    Q --> T[/motivate Command]
    Q --> U[Hidden Commands]
    
    R --> V[Team-wide Confetti]
    S --> W[Achievement Animation]
    T --> X[Random Motivation]
    U --> Y[Special Effects]
    
    V --> Z[Broadcast to All Members]
    W --> Z
    X --> Z
    Y --> Z
    
    AA[Bot Settings] --> BB[Personality Selection]
    AA --> CC[Message Frequency]
    AA --> DD[Effect Preferences]
    
    BB --> EE[Friendly/Professional/Casual]
    CC --> FF[High/Medium/Low/Off]
    DD --> GG[Enable/Disable Animations]
    DD --> HH[Enable/Disable Sounds]
    
    EE --> II[Update Bot Behavior]
    FF --> II
    GG --> II
    HH --> II
```

## 📱 Mobile Experience Flow

```mermaid
graph TD
    A[Mobile Access] --> B[Responsive Layout Detection]
    B --> C[Mobile-optimized Interface]
    
    C --> D[Touch-friendly Navigation]
    D --> E[Large Touch Targets]
    D --> F[Swipe Gestures]
    D --> G[Long-press Actions]
    
    H[Mobile Kanban] --> I[Single Column View]
    I --> J[Horizontal Scroll]
    J --> K[Touch Drag & Drop]
    K --> L[Haptic Feedback]
    
    M[Mobile Chat] --> N[Full-screen Chat Mode]
    N --> O[Keyboard Optimization]
    O --> P[Auto-scroll to Latest]
    
    Q[Mobile File Upload] --> R[Camera Integration]
    R --> S[Photo Capture]
    R --> T[Gallery Selection]
    S --> U[Image Processing]
    T --> U
    U --> V[Upload with Progress]
    
    W[Mobile Polls] --> X[Touch Voting Interface]
    X --> Y[Large Vote Buttons]
    Y --> Z[Immediate Visual Feedback]
    
    AA[Performance Optimization] --> BB[Lite Mode Detection]
    BB --> CC[Reduced Animations]
    BB --> DD[Simplified Effects]
    BB --> EE[Battery Awareness]
    
    FF[Offline Mobile] --> GG[Local Storage Caching]
    GG --> HH[Offline Indicators]
    HH --> II[Sync When Online]
```

## 🔄 Error Handling & Recovery Flow

```mermaid
graph TD
    A[User Action] --> B[Operation Execution]
    B --> C{Operation Success?}
    
    C -->|Success| D[Normal Flow Continues]
    C -->|Error| E[Error Categorization]
    
    E --> F[Network Error]
    E --> G[Permission Error]
    E --> H[Validation Error]
    E --> I[Storage Error]
    E --> J[Unknown Error]
    
    F --> K[Network Error Handler]
    G --> L[Permission Error Handler]
    H --> M[Validation Error Handler]
    I --> N[Storage Error Handler]
    J --> O[Generic Error Handler]
    
    K --> P[Check Connection]
    P -->|Online| Q[Retry with Backoff]
    P -->|Offline| R[Queue for Later]
    
    L --> S[Show Permission Message]
    S --> T[Suggest Resolution]
    
    M --> U[Highlight Invalid Fields]
    U --> V[Show Validation Messages]
    
    N --> W[Check Storage Quota]
    W --> X[Suggest Cleanup]
    
    O --> Y[Log Error Details]
    Y --> Z[Show Generic Message]
    
    Q --> AA{Retry Successful?}
    AA -->|Yes| D
    AA -->|No| BB[Show Retry Options]
    
    R --> CC[Offline Queue]
    CC --> DD[Sync When Online]
    
    BB --> EE[Manual Retry Button]
    BB --> FF[Report Issue Button]
    BB --> GG[Continue Without Feature]
    
    EE --> B
    FF --> HH[Error Reporting]
    GG --> II[Graceful Degradation]
    
    HH --> JJ[Collect Error Context]
    JJ --> KK[Send Error Report]
    KK --> LL[Thank User]
    
    II --> MM[Basic Functionality Only]
    MM --> NN[Enhancement Features Disabled]
```

## 🎛️ Feature Flag Flow

```mermaid
graph TD
    A[Feature Flag Check] --> B[Load Feature Configuration]
    B --> C[Environment Variables]
    B --> D[User Preferences]
    B --> E[Team Settings]
    
    C --> F[Global Feature Flags]
    D --> G[User-level Overrides]
    E --> H[Team-level Overrides]
    
    F --> I[Feature Evaluation]
    G --> I
    H --> I
    
    I --> J{Feature Enabled?}
    J -->|Yes| K[Render Feature]
    J -->|No| L[Hide Feature]
    
    K --> M[Full Feature Functionality]
    L --> N[Graceful Degradation]
    
    O[Feature Flag Manager] --> P[Admin Interface]
    P --> Q[Toggle Features]
    Q --> R[Update Configuration]
    R --> S[Real-time Update]
    S --> T[Refresh Feature States]
    
    U[A/B Testing] --> V[User Cohort Assignment]
    V --> W[Feature Variant Selection]
    W --> X[Track Usage Metrics]
    X --> Y[Analytics Collection]
```

## 🔍 Search & Discovery Flow

```mermaid
graph TD
    A[Search Interface] --> B[Search Input]
    B --> C[Real-time Search]
    C --> D[Search Categories]
    
    D --> E[Tasks Search]
    D --> F[Messages Search]
    D --> G[Files Search]
    D --> H[Ideas Search]
    D --> I[Polls Search]
    
    E --> J[Task Title/Description]
    F --> K[Message Content]
    G --> L[File Names/Annotations]
    H --> M[Idea Title/Tags]
    I --> N[Poll Questions]
    
    J --> O[Search Results]
    K --> O
    L --> O
    M --> O
    N --> O
    
    O --> P[Relevance Ranking]
    P --> Q[Result Categories]
    Q --> R[Click to Navigate]
    
    S[Filter Options] --> T[Date Range]
    S --> U[Content Type]
    S --> V[Team Member]
    S --> W[Status/Priority]
    
    T --> X[Apply Filters]
    U --> X
    V --> X
    W --> X
    X --> O
    
    Y[Recent Searches] --> Z[Search History]
    Z --> AA[Quick Access]
    AA --> B
```

## 📈 Analytics & Insights Flow

```mermaid
graph TD
    A[Analytics Dashboard] --> B[Team Performance Metrics]
    B --> C[Task Completion Rate]
    B --> D[Communication Activity]
    B --> E[File Sharing Usage]
    B --> F[Idea Generation Rate]
    
    C --> G[Progress Visualization]
    D --> H[Message Frequency Charts]
    E --> I[File Upload Trends]
    F --> J[Innovation Metrics]
    
    G --> K[Time-based Analysis]
    H --> K
    I --> K
    J --> K
    
    K --> L[Daily Activity Patterns]
    K --> M[Weekly Progress Reports]
    K --> N[Milestone Tracking]
    
    O[Individual Analytics] --> P[Personal Performance]
    P --> Q[Points Earned]
    P --> R[Achievements Unlocked]
    P --> S[Contribution Breakdown]
    
    Q --> T[Gamification Insights]
    R --> T
    S --> T
    
    T --> U[Motivation Recommendations]
    U --> V[Personalized Goals]
    V --> W[Achievement Suggestions]
    
    X[Team Insights] --> Y[Collaboration Patterns]
    Y --> Z[Communication Networks]
    Y --> AA[Skill Distribution]
    Y --> BB[Workload Balance]
    
    Z --> CC[Team Health Score]
    AA --> CC
    BB --> CC
    
    CC --> DD[Recommendations]
    DD --> EE[Process Improvements]
    DD --> FF[Resource Allocation]
    DD --> GG[Team Building Suggestions]
```

## 🎨 Theming & Customization Flow

```mermaid
graph TD
    A[Theme System] --> B[Dark Theme Default]
    B --> C[System Theme Detection]
    C --> D[User Preference Override]
    
    D --> E[Theme Provider]
    E --> F[CSS Custom Properties]
    F --> G[Component Styling]
    
    H[Customization Options] --> I[Color Scheme Selection]
    H --> J[Animation Preferences]
    H --> K[Density Settings]
    H --> L[Accessibility Options]
    
    I --> M[Primary Color Variants]
    I --> N[Accent Color Options]
    
    J --> O[Enable/Disable Animations]
    J --> P[Reduced Motion Support]
    
    K --> Q[Compact/Comfortable/Spacious]
    
    L --> R[High Contrast Mode]
    L --> S[Large Text Option]
    L --> T[Focus Indicators]
    
    M --> U[Apply Theme Changes]
    N --> U
    O --> U
    P --> U
    Q --> U
    R --> U
    S --> U
    T --> U
    
    U --> V[Real-time Theme Update]
    V --> W[Persist User Preferences]
    W --> X[Local Storage Save]
```

## 🔐 Security & Privacy Flow

```mermaid
graph TD
    A[Security Layer] --> B[Authentication Check]
    B --> C[Session Validation]
    C --> D[Permission Verification]
    
    D --> E[Team-based Access Control]
    E --> F[Resource Permission Check]
    F --> G{Access Granted?}
    
    G -->|Yes| H[Allow Operation]
    G -->|No| I[Deny Access]
    
    I --> J[Security Error Message]
    J --> K[Redirect to Safe Area]
    
    L[Data Privacy] --> M[PII Detection]
    M --> N[Data Sanitization]
    N --> O[Secure Storage]
    
    P[File Upload Security] --> Q[File Type Validation]
    P --> R[Size Limit Check]
    P --> S[Malware Scanning]
    
    Q --> T{Safe File Type?}
    R --> U{Within Limits?}
    S --> V{Clean File?}
    
    T -->|No| W[Reject Upload]
    U -->|No| W
    V -->|No| W
    
    T -->|Yes| X[Process Upload]
    U -->|Yes| X
    V -->|Yes| X
    
    W --> Y[Security Warning]
    X --> Z[Secure File Storage]
    
    AA[Audit Trail] --> BB[Action Logging]
    BB --> CC[User Activity Tracking]
    CC --> DD[Security Event Monitoring]
    DD --> EE[Anomaly Detection]
```

## 🌐 Real-time Synchronization Flow

```mermaid
graph TD
    A[Real-time System] --> B[Appwrite Subscriptions]
    B --> C[WebSocket Connection]
    C --> D[Event Listeners]
    
    D --> E[Task Updates]
    D --> F[Message Events]
    D --> G[File Changes]
    D --> H[Idea Votes]
    D --> I[Poll Results]
    D --> J[Achievement Unlocks]
    
    E --> K[Update Kanban Board]
    F --> L[Update Chat Interface]
    G --> M[Update File Library]
    H --> N[Update Idea Board]
    I --> O[Update Poll Display]
    J --> P[Show Celebration]
    
    K --> Q[Real-time UI Update]
    L --> Q
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    Q --> R[Optimistic Updates]
    R --> S[Server Confirmation]
    S --> T{Confirmation Success?}
    
    T -->|Yes| U[Maintain Update]
    T -->|No| V[Revert Update]
    
    V --> W[Show Sync Error]
    W --> X[Retry Mechanism]
    X --> Y[Exponential Backoff]
    
    Z[Connection Management] --> AA[Connection Status Monitor]
    AA --> BB{Connected?}
    BB -->|Yes| CC[Normal Operation]
    BB -->|No| DD[Offline Mode]
    
    DD --> EE[Queue Operations]
    EE --> FF[Show Offline Indicator]
    FF --> GG[Reconnection Attempts]
    GG --> HH[Sync Queued Operations]
```

---

## 📋 User Journey Summary (Simplified)

### New User Journey (First Time)
1. **Discovery** → OAuth Registration (GitHub/Google)
2. **Onboarding** → Console Tour → Create/Join Hackathon
3. **Team Setup** → Create/Join Team → Role Assignment
4. **Core Features** → Task Creation → Chat Usage → File Sharing
5. **Collaboration** → Team Communication → Progress Tracking

### Returning User Journey
1. **OAuth Login** → Console → Select Active Hackathon
2. **Dashboard** → Check Progress → Review Team Status
3. **Collaboration** → Tasks → Chat → Files → Documents
4. **Productivity** → Complete Tasks → Track Progress
5. **Submission** → Build Submission → Finalize for Judges

### Team Leader Journey
1. **Team Management** → Create Team → Share Join Code
2. **Task Coordination** → Assign Tasks → Monitor Progress
3. **Resource Management** → File Organization → Document Management
4. **Team Actions** → Leave Team (Members) → Delete Team (Leaders)
5. **Data Management** → Comprehensive Team Data Cleanup
6. **Submission Oversight** → Review Submission → Final Approval

### Judge Journey
1. **Direct Access** → Public Submission URL → No Authentication
2. **Evaluation** → Review Project Details → Check Demo Links
3. **Assessment** → Technical Evaluation → Team Contributions
4. **Decision** → Scoring → Feedback → Final Judgment

This comprehensive UX flowchart covers all major user interactions and system flows in HackerDen, providing a detailed map of the user experience from entry to completion of hackathon activities.