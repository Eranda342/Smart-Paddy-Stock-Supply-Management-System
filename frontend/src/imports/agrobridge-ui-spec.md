AGROBRIDGE — FINAL PROFESSIONAL UI SYSTEM

Design a modern SaaS web application called AgroBridge.

AgroBridge is a Sri Lankan agricultural marketplace platform connecting Farmers and Rice Mill Owners through a secure digital system where they can list paddy harvests, negotiate prices, complete transactions, and coordinate transport.

The system includes Admin verification, ensuring all farmers and rice mills are verified before trading.

The UI must feel:

• Professional SaaS platform
• Government-grade trust
• Startup launch ready
• Portfolio quality
• Clean and structured
• Screenshot friendly
• Not oversized
• Not cluttered

Use English only.
Do not include language selection.

⸻

GLOBAL LAYOUT SYSTEM

Desktop frame: 1440 × 900

Everything must fit within the viewport.

Avoid very long pages.

Maximum content width: 1320px

Outer padding: 60px

Grid system: 12 columns

Spacing system: 8px

Card spacing: 24px

Section spacing: 40px

⸻

COLOR SYSTEM

Default theme: Dark Mode

Background: #0F1115
Card background: #161A20
Sidebar background: #0B0E12
Primary accent: #22C55E
Muted text: soft gray
Borders: subtle gray

Include light mode toggle in the top navbar.

Light mode:

Background: #F8FAFC
Card: #FFFFFF
Primary: #15803D

Use smooth 200ms theme transition.

⸻

CARD DESIGN SYSTEM

Border radius: 16px

Soft shadow

Subtle hover lift animation

Authentication cards width: 520px

Dashboard cards aligned in consistent grid.

⸻

AUTHENTICATION FLOW

Split layout authentication pages.

Left side: agricultural image
Right side: form card

Layout ratio: 50 / 50

Header includes:

AgroBridge logo (left)
Back to Home (right)

Registration steps:

Login
Role Selection
Account Information
Business Details
Success Confirmation

Progress bars show steps only, not percentages.

⸻

LOGIN PAGE

Left panel:

Dark Sri Lankan rice field image with subtle green overlay.

Bottom text:

Connecting Farmers and Rice Mill Owners Digitally
Secure and Verified Paddy Marketplace

Right panel:

Centered login card.

Fields:

Email or Mobile Number
Password with show/hide toggle
Remember Me
Forgot Password

Primary login button.

Divider.

Create Account link.

Trust indicators:

Secure Login
Admin Verified Accounts
Sri Lankan Agriculture Marketplace

Everything must fit within viewport.

⸻

REGISTRATION STEP 1 — ROLE SELECTION

Header:

Logo
Back to Home
Step 1 of 3 indicator

Centered card.

Title:

How will you use AgroBridge?

Two role selection cards:

Farmer
Rice Mill Owner

Each card includes:

Icon
Short description
Hover highlight

Clicking role automatically proceeds to next step.

No continue button.

⸻

REGISTRATION STEP 2 — ACCOUNT INFORMATION

Header shows Step 2 of 3.

Card layout uses two columns.

Fields:

Full Name
NIC Number
Email Address
Mobile Number (+94 format)
Password
Confirm Password

Password strength indicator.

Buttons:

Previous
Continue

Footer note:

Your information is securely encrypted.

⸻

REGISTRATION STEP 3 — BUSINESS DETAILS

Header shows Step 3 of 3.

Form fields depend on selected role.

⸻

FARMER REGISTRATION

Fields:

Operating District
Land Size (Acres)
Paddy Types Cultivated
Estimated Monthly Paddy Stock (kg)

⸻

OPERATING DISTRICT

Searchable dropdown including all Sri Lankan districts:

Ampara
Anuradhapura
Badulla
Batticaloa
Colombo
Galle
Gampaha
Hambantota
Jaffna
Kalutara
Kandy
Kegalle
Kilinochchi
Kurunegala
Mannar
Matale
Matara
Monaragala
Mullaitivu
Nuwara Eliya
Polonnaruwa
Puttalam
Ratnapura
Trincomalee
Vavuniya

⸻

PADDY TYPES CULTIVATED

Use selectable chips instead of default multi-select list.

Available types:

Samba
Keeri Samba
Nadu
Red Rice
White Rice
Basmati
Suwandel

Selected chips highlight in green.

Allow multiple selections.

⸻

LAND OWNERSHIP VERIFICATION

Upload section appears only for farmers.

Title:

Land Ownership Verification

Upload field:

Upload Land Ownership Document

Accepted files:

PDF
JPG
PNG

Examples:

Land Deed
Lease Agreement
Government Farming Certificate

Drag-and-drop upload card with helper text.

⸻

MILL OWNER REGISTRATION

Fields:

Business Name
Business Registration Number
Mill Location

⸻

BUSINESS VERIFICATION

Upload field:

Upload Business Registration Document

Accepted examples:

Business Registration Certificate
Rice Mill Operating License
Government Certification

Upload component same style as farmer upload card.

⸻

VERIFICATION NOTICE

Show notice card:

Administrative Verification Required

Your account will be reviewed by AgroBridge administrators before trading access is granted.

Buttons:

Previous
Submit Registration

⸻

REGISTRATION SUCCESS PAGE

Centered confirmation card.

Large success icon.

Text:

Registration Submitted Successfully

Your account is currently under administrative review.

Estimated approval time displayed.

Return to Login button.

⸻

PUBLIC LANDING PAGE

Hero section with dark agricultural background.

Headline:

Digitizing Sri Lanka’s Paddy Marketplace

Buttons:

Get Started
Login

Features section:

Secure Verified Trading
Direct Negotiation
Transparent Pricing
Transport Coordination

How It Works:

Register
Get Verified
Trade Paddy
Arrange Transport

Footer:

About
Contact
Privacy Policy
Terms

⸻

FARMER SYSTEM

Sidebar width: 260px

Menu:

Dashboard
My Listings
Negotiations
Transactions
Transport
Profile
Logout

Active menu item highlighted with green accent.

⸻

FARMER DASHBOARD

Top navbar includes:

Page title
Search bar
Notifications
Theme toggle
User avatar

⸻

DASHBOARD OVERVIEW

Metric cards:

Active Listings
Ongoing Negotiations
Completed Transactions
Monthly Revenue

Each card shows:

Large number
Label
Trend indicator

⸻

CHARTS

Two column layout:

Sales Line Chart
Paddy Distribution Donut Chart

Minimal grid lines.

⸻

RECENT ACTIVITY TABLE

Columns:

Date
Paddy Type
Quantity
Status
Action

Row height: 56px

Status badges:

Completed (green)
Pending (yellow)
Rejected (red)
In Transit (blue)

⸻

FARMER — MY LISTINGS

Create Listing button top right.

Table columns:

Paddy Type
Quantity
Price
District
Status
Actions

Add listing modal.

Empty state illustration if no listings exist.

⸻

FARMER — NEGOTIATIONS

Two panel layout.

Left side:

Negotiation threads.

Right side:

Conversation interface.

Options:

Offer Price
Counter Offer
Accept
Reject

⸻

FARMER — TRANSACTIONS

Columns:

Buyer
Paddy Type
Quantity
Final Price
Payment Status
Transport Status

Transaction detail page includes timeline:

Negotiation
Confirmation
Payment
Transport
Completed

⸻

FARMER — TRANSPORT

Sections:

Active Transport Card
Transport History Table

Shows vehicle assigned and delivery status.

⸻

FARMER — PROFILE

Editable profile.

Sections:

Personal Information
Contact Information
Security

Verification status:

Land Verification
Pending / Verified / Rejected

Allow re-upload if rejected.

⸻

MILL OWNER SYSTEM

Sidebar:

Dashboard
Browse Listings
Negotiations
Transactions
Transport
Vehicles
Profile
Logout

⸻

MILL OWNER DASHBOARD

Metric cards:

Active Purchases
Ongoing Negotiations
Monthly Procurement
Total Spend

Bar chart:

Procurement by Paddy Type.

Recent purchase table.

⸻

BROWSE LISTINGS

Left filter panel:

District
Paddy Type
Quantity
Price Range

Right grid:

Listing cards showing:

Farmer
Location
Paddy Type
Price
Quantity
Negotiate button.

⸻

MILL OWNER — NEGOTIATIONS

Same chat interface as farmer.

⸻

MILL OWNER — TRANSACTIONS

Procurement history table.

⸻

MILL OWNER — TRANSPORT

Sections:

Active Transport
Transport History

Transport shows assigned vehicles.

⸻

MILL OWNER — VEHICLE MANAGEMENT

Vehicle table.

Columns:

Vehicle Number
Vehicle Type
Capacity
Driver Name
Driver Phone
Status
Actions

Add Vehicle button.

⸻

ADD VEHICLE MODAL

Fields:

Vehicle Number
Vehicle Type
Capacity
Driver Name
Driver Phone

Buttons:

Cancel
Save Vehicle

⸻

ADMIN SYSTEM

Sidebar:

Dashboard
Pending Verifications
Users
Reports
Logout

⸻

ADMIN DASHBOARD

Metric cards:

Total Users
Pending Approvals
Active Listings
Total Transactions

Charts:

Monthly Trading Volume
User Growth

⸻

ADMIN — PENDING VERIFICATIONS

Table columns:

Name
Role
NIC
Verification Documents
Approve
Reject

Document preview modal.

⸻

ADMIN — USERS

User management table.

Filters:

Farmer
Mill Owner
Active
Suspended

⸻

ADMIN — REPORTS

Analytics dashboard.

Charts:

Trading Volume
Top Districts
Top Paddy Types

Export report button.

⸻

TABLE DESIGN RULES

Row height: 56px

Minimal borders.

Use spacing instead of heavy grid lines.

Consistent typography.

⸻

UI MICRO INTERACTIONS

Card hover lift
Button hover transition
Sidebar highlight animation
Notification dropdown animation

Animation duration: 200ms

⸻

FINAL PRODUCT FEEL

The design must resemble modern SaaS dashboards such as:

Stripe
Linear
Professional fintech platforms

The interface must feel clean, structured, and trustworthy, suitable for academic submission, portfolio presentation, and real startup development.