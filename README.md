# MediConnect: Doctors & Patient Management App

MediConnect is a lightweight, assistant-driven healthcare management platform designed to streamline interactions between doctors and patients. Built with React, TypeScript, and Vite, it emphasizes a clean architecture, strict size constraints (<1 MB), and smart context-aware assistance.

## Chosen Vertical
**Doctors & Patient Management App**

## Architecture and Approach
MediConnect follows a modular, interface-driven architecture to keep code robust, testable, and strictly bound by size constraints.
- **Service Layer Abstraction:** We use interfaces for Authentication, Data Management, and Assistant features. This allows the application to cleanly inject either fully mocked data models or real Firebase/Firestore configurations seamlessly via environment variables (`VITE_USE_MOCK_DATA`).
- **Component-Driven UI:** Components follow a custom design system based on modern design principles (Material-inspired glassmorphism, responsive tiles). The UI is built using CSS Modules with custom base tokens for easy Light/Dark mode toggling.
- **Role-Based Routing:** `react-router-dom` is used alongside context providers to authenticate and authorize users into appropriate realms—either the **Doctor Dashboard** or the **Patient Portal**.

### File Structure & Architecture
The project follows a standard Vite/React layout organized by domain:

```
├── public/                 # Static assets (favicons, etc.)
├── src/                    
│   ├── components/         
│   │   ├── assistant/      # Assistant UI components (Context-aware panel)
│   │   ├── layout/         # App layouts (Header, Sidebar, Shell)
│   │   └── ui/             # Reusable design system components (Button, Modal, etc.)
│   ├── context/            # Global React providers (AuthContext, ThemeContext)
│   ├── hooks/              # Custom hook logic (e.g., useAssistant)
│   ├── mock/               # In-memory datasets to support offline demonstration
│   ├── pages/              
│   │   ├── auth/           # Login flows
│   │   ├── doctor/         # Doctor realm (Dashboard, Patient lists)
│   │   └── patient/        # Patient realm (Appointments, Prescriptions)
│   ├── services/           # Abstraction layer for data and business logic
│   │   ├── auth.ts         # Authentication handling (Firebase vs Mock)
│   │   ├── data.ts         # CRUD Operations (Firestore vs Mock)
│   │   ├── assistant.ts    # Assistant rules / Gemini API interface
│   │   ├── calendar.ts     # Generate embedded calendar events
│   │   └── firebase.ts     # Firebase initialization handler
│   ├── styles/             # Global CSS Modules and Design Tokens
│   ├── types/              # Cross-domain TypeScript interfaces
│   ├── App.tsx             # Root Router configuration
│   └── main.tsx            # React DOM Entrypoint
└── package.json            # Scripts & App dependencies
```

## How the Assistant Logic Works
The Assistant Service (`src/services/assistant.ts`) provides role-aware and context-sensitive suggestions.
- **Rules-Based Engine:** By default, it evaluates the user's role (Doctor/Patient), current page, upcoming appointments, and patient health metrics (e.g., risk levels). It injects actionable cards such as "Overdue for follow-up" or "⚠ High-risk patient warning".
- **AI Integration Path (Gemini):** A `GeminiAssistantService` stub demonstrates how these contextual prompts can be seamlessly swapped out to invoke Vertex AI or Gemini apis, evaluating comprehensive context objects for dynamic, generated recommendations. This is toggled via `VITE_ASSISTANT_MODE`.

## How Google Services are Used
1. **Firebase Authentication:** Handles secure user login, registration, and session management using Identity Platform.
2. **Cloud Firestore:** Serves as the primary NoSQL datastore for persistence of Users, Appointments, Prescriptions, and Visit Summaries.
3. **Google Calendar:** Generates semantic "Add to Calendar" URLs for scheduled appointments via external web intents, removing the need for heavy API SDKs on the client-side.
4. **Google Gemini (Integration Path):** Outlined structure to implement dynamic AI analysis natively within the app.

## Setup and Run Instructions
To run this project locally, ensure you have Node.js and NPM installed.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Rename `.env.example` to `.env` and fill in your Firebase credentials if using live data APIs. 
   By default, the app is configured to use mock data for immediate evaluation.

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. **Testing & Building:**
   - To run tests (Vitest): `npm run test`
   - To create a production build: `npm run build`

## Assumptions and Limitations
- **Mock Data Priority:** Given the constraints surrounding automated testing and review, the app defaults to an intensive mock data layer to allow full functionality out of the box without requiring external Firebase configurations.
- **Repository Size Constraints:** Large chart libraries and full SDK implementations of Google Calendar API were avoided to adhere strictly to the <1 MB repository footprint requirement.
- **Mobile Responsiveness:** Prioritizes desktop and tablet dashboards, with basic flex stacking logic implemented for mobile views.
