OpenAPI Documentation Viewer - Complete Requirements Document
Project Overview
Build a professional, customizable OpenAPI documentation viewer component for Next.js that renders Swagger/OpenAPI YML specifications in a beautiful, interactive format with API testing capabilities.
Core Requirements

1. Component Interface
   Root Component
   <OpenAPIViewer
   source={string} // Required: URL or local file path to OpenAPI YML
   branding={{          // Optional: Branding configuration
       logo: string,      // Logo URL or path
       title: string,     // Documentation title
       primaryColor: string  // Theme color (default: #10b981 - green)
     }}
   />

2. Input Specifications
   Source Input
   Format: OpenAPI/Swagger YML file (YAML format)
   Location:
   Remote URL (e.g., https://api.example.com/openapi.yml)
   Local file path (e.g., /public/api-spec.yml)
   Standard: Must follow OpenAPI 3.0+ specification
   No Sample Data: Use actual YML file provided, not mock/sample schemas
   Branding Configuration
   Logo: URL or path to brand logo image
   Title: Custom title for the documentation page
   Primary Color: Hex color code for theming (customizable, default green #10b981)
   Architecture & Layout
3. Layout Structure
   ┌─────────────────────────────────────────────────────┐
   │ HEADER │
   │ [Logo] [Title] [Search?] │
   ├──────────┬──────────────────────────────────────────┤
   │ │ │
   │ SIDEBAR │ CONTENT AREA │
   │ │ │
   │ API │ • Endpoint Details │
   │ Groups │ • Request/Response │
   │ - Tag1 │ • Try It Out │
   │ GET │ • Schemas │
   │ POST │ • Examples │
   │ - Tag2 │ │
   │ GET │ │
   │ │ │
   └──────────┴──────────────────────────────────────────┘

Layout Sections:
Header (Top, full-width)

Logo (left)
Documentation title
Optional search/utilities (right)
Sidebar (Left, fixed width, scrollable)

Grouped API endpoints by tags
HTTP method badges
Endpoint paths
Collapsible groups
Content Area (Right, main content, scrollable)

Selected endpoint documentation
Interactive API testing
Request/Response details
Schema visualization
Component Breakdown 4. Required Components (No Comments in Code)
Core Components:
OpenAPIViewer

Root component
Props handling
YML fetching and parsing
State management
Theme provider
Header

Logo display
Title display
Branding colors
Sticky positioning
Sidebar

Endpoint listing
Group by tags
Method badges (GET, POST, PUT, DELETE, PATCH)
Active endpoint highlighting
Search/filter functionality
Collapsible sections
ContentArea

Main documentation display
Route-based content switching
Scroll management
APIEndpoint

Endpoint title and description
HTTP method and path
Parameters (path, query, header, cookie)
Request body schema
Response schemas
Response examples
Security requirements
RequestExecutor

"Try It Out" interface
Parameter input fields
Request body editor (JSON)
Authentication input (based on spec)
Execute button
Loading states
ResponseViewer

HTTP status code display
Response headers
Response body with syntax highlighting
Error handling
Copy response functionality
SchemaRenderer

Display object schemas
Nested properties
Data types
Required fields
Descriptions
Expandable/collapsible
AuthenticationInput

Dynamic based on security schemes
API Key input
Bearer token input
Header/Query parameter placement
Secure input fields
MethodBadge

Color-coded HTTP methods
GET (green), POST (blue), PUT (orange), DELETE (red), PATCH (purple)
Utility Components/Functions:
ymlParser

Fetch YML from URL or local path
Parse YML to JSON
Validate OpenAPI structure
Error handling
apiExecutor

Execute HTTP requests
Apply authentication
Handle CORS
Process responses
Error handling
themeProvider

Apply custom colors
CSS variable management
Dynamic theming
Functional Requirements 5. YML Processing
Parse OpenAPI YML:
Fetch from remote URL or local path
Convert YML to JSON structure
Extract key sections:
info (title, description, version)
servers (API base URLs)
paths (endpoints)
components (schemas, securitySchemes)
tags (grouping)
security (global auth requirements)
Handle Errors:
Invalid YML format
Network errors (for remote URLs)
Missing required fields
Malformed schemas 6. Documentation Display
Endpoint Information:
HTTP method and path
Summary and description
Operation ID
Tags/categories
Deprecated status
Parameters:
Path parameters
Query parameters
Header parameters
Cookie parameters
Display: name, type, required, description, default value, examples
Request Body:
Content types supported (application/json, etc.)
Schema structure
Required fields
Examples
Responses:
HTTP status codes (200, 400, 404, 500, etc.)
Response descriptions
Response schemas
Response examples
Headers returned
Schemas:
Object properties
Data types (string, number, boolean, array, object)
Nested objects
Arrays of objects
Required vs optional fields
Format specifications (date-time, email, uuid, etc.)
Enums
Min/max values, patterns 7. API Execution ("Try It Out")
Execution Requirements:
Only enable if servers array exists in YML
Use first server as default base URL
Allow server selection if multiple servers defined
Request Building:
Collect parameter values from user input
Build request URL with path and query parameters
Construct request headers
Include request body (JSON editor)
Apply authentication
Authentication Handling:
Extract from components.securitySchemes in YML
Support auth types (for now):
API Key (in header or query)
Bearer Token (Authorization header)
Show input fields based on endpoint's security requirements
Future support: OAuth2, OpenID Connect (mention as TODO)
Response Display:
HTTP status code with color coding
Response time
Response size
Response headers (collapsible)
Response body with syntax highlighting (JSON)
Pretty print JSON
Copy to clipboard functionality
Error messages for failed requests
Edge Cases:
Handle CORS issues (display appropriate message)
Network timeouts
Invalid responses
Server errors 8. Authentication Flow
Parse components.securitySchemes from YML
Check endpoint's security array
Display required auth inputs:
API Key: Show input field, specify location (header/query), parameter name
Bearer Token: Show token input field
User enters credentials
Apply to request:
API Key: Add to header or query as specified
Bearer: Add Authorization: Bearer {token} header
Store credentials temporarily (session/component state)
Reuse for subsequent requests in same session
Technical Specifications 9. Technology Stack
Framework: Next.js (existing project)
Styling: Tailwind CSS (utility classes only, no custom config required)
YML Parsing: js-yaml library
HTTP Requests: Fetch API
Syntax Highlighting: react-syntax-highlighter or similar
State Management: React hooks (useState, useEffect, useContext) 10. Styling Requirements
Tailwind Usage:
Use core Tailwind utility classes only
No custom Tailwind configuration
Responsive design (mobile-friendly)
Dark/light theme support (optional)
Theme Customization:
Primary color customizable via props
Apply to:
Active links
Buttons
Method badges
Hover states
Borders
Use CSS variables for dynamic theming
Design Principles:
Clean, professional appearance
Similar to Stoplight Elements quality
Proper spacing and typography
Smooth transitions and interactions
Accessible (WCAG compliant) 11. Code Quality
No Comments: Write self-explanatory code without comments
Multiple Components: Break into small, reusable components
TypeScript: Use TypeScript for type safety (optional but recommended)
Error Handling: Comprehensive error boundaries and validation
Performance: Lazy loading, memoization where appropriate
Clean Code: Follow React best practices
Feature Specifications 12. Core Features (MVP)
Must Have:
✅ Parse OpenAPI YML from URL or local path
✅ Beautiful documentation rendering
✅ Sidebar navigation with tag grouping
✅ Endpoint details display
✅ Request/Response schema visualization
✅ Examples display
✅ HTTP method badges with color coding
✅ Try-it-out functionality with real API execution
✅ API Key authentication support
✅ Bearer token authentication support
✅ Response display with syntax highlighting
✅ Customizable branding (logo, title, color)
✅ Responsive layout
✅ Error handling
Nice to Have (Future):
Search functionality across endpoints
Deep linking to specific endpoints
Export/download API collection
Request history
OAuth2 support
Code generation (curl, JavaScript, Python)
Dark mode toggle
Collapsible sidebar
Keyboard shortcuts 13. User Interactions
Navigation:
Click endpoint in sidebar → Display in content area
Highlight active endpoint
Smooth scrolling
Breadcrumbs (optional)
API Testing:
Click "Try It Out" button
Enter required parameters
Enter authentication if required
Click "Execute"
View response below
Copy response
Repeat with different values
Visual Feedback:
Loading spinners during fetch/execution
Success/error toast notifications
Disabled states for invalid inputs
Validation messages
Hover effects
Data Flow 14. Application Flow

1. Component Mount
   ↓
2. Fetch YML (from source prop)
   ↓
3. Parse YML → JSON
   ↓
4. Extract Structure
   - Info
   - Servers
   - Paths (endpoints)
   - Schemas
   - Security Schemes
     ↓
5. Render UI
   - Header (with branding)
   - Sidebar (with endpoints)
   - Content (first endpoint by default)
     ↓
6. User Interactions

   - Select endpoint → Update content
   - Try It Out → Show input fields
   - Enter params/auth → Enable execute
   - Execute → Make API call → Show response

7. State Management
   Component State:
   Parsed OpenAPI spec (JSON)
   Selected endpoint
   User input values (parameters, body, auth)
   API response data
   Loading states
   Error states
   UI states (collapsed/expanded sections)
   Derived State:
   Grouped endpoints by tags
   Filtered endpoints (if search implemented)
   Computed request URL
   Formatted response
   Edge Cases & Error Handling
8. Error Scenarios
   YML Loading:
   Invalid URL (404, 500)
   Network timeout
   CORS issues
   Invalid YML syntax
   Missing required OpenAPI fields
   API Execution:
   Missing authentication
   Invalid parameter values
   Server unreachable
   CORS errors
   Timeout
   Invalid response format
   Display:
   Missing descriptions
   Undefined schemas
   Circular references in schemas
   Very large responses
   Binary response data
   User Actions:
   Required fields not filled
   Invalid input formats
   Authentication credentials expired
   Success Criteria
9. Acceptance Criteria
   The component is complete when:
   ✅ Accepts YML file (URL or local path) and renders successfully
   ✅ Displays all endpoints grouped by tags
   ✅ Shows complete endpoint documentation (params, body, responses)
   ✅ Executes API calls with proper authentication
   ✅ Displays responses with syntax highlighting
   ✅ Applies custom branding (logo, title, color)
   ✅ Professional, clean UI comparable to Stoplight Elements
   ✅ Mobile responsive
   ✅ Handles errors gracefully
   ✅ No comments in code
   ✅ Uses multiple well-structured components
   ✅ Built with Tailwind CSS
   Example Usage
10. Implementation Example
    // In your Next.js page or component

import OpenAPIViewer from '@/components/OpenAPIViewer';

export default function APIDocsPage() {
return (
<OpenAPIViewer
source="https://petstore3.swagger.io/api/v3/openapi.yaml"
branding={{
        logo: "/logo.png",
        title: "My API Documentation",
        primaryColor: "#10b981"
      }}
/>
);
}

Alternative (Local File):
<OpenAPIViewer
source="/api-specs/my-api.yml"
branding={{
    logo: "/company-logo.svg",
    title: "Company API Docs",
    primaryColor: "#3b82f6"
  }}
/>

Deliverables 19. What to Deliver
OpenAPIViewer Component - Fully functional root component
All Sub-components - Header, Sidebar, ContentArea, etc.
Utility Functions - YML parser, API executor, theme provider
TypeScript Types - Interface definitions (if using TS)
README - Usage instructions and props documentation
Example - Working example with sample OpenAPI YML
Non-Requirements (Out of Scope) 20. What NOT to Build
❌ YML editor/creator
❌ OpenAPI spec validator beyond basic parsing
❌ API mocking/stubbing
❌ Database integration
❌ Analytics/tracking
❌ Multi-language support (i18n)
❌ PDF export
❌ Collaborative features
Summary
Build a professional, production-ready OpenAPI documentation viewer component that:
Takes a YML source and branding config
Renders beautiful, interactive API documentation
Supports API testing with authentication
Uses clean, component-based architecture
Styled with Tailwind CSS
Comparable in quality to Stoplight Elements
No comments, multiple components, professional code
Reference Implementation Style: @stoplight/elements (but custom-built with our components)
