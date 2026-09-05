Design and build a professional, functional web application for a Smart India Hackathon (SIH) project focused on **honey adulteration detection, honey source traceability, and supply-chain transparency**.

The platform should feel like a real government/food-safety/agri-tech product rather than an AI-generated concept website.

PROJECT NAME:
**HoneyTrace**

TAGLINE:
**“From Hive to Home — Verified Honey, Transparent Supply.”**

CORE PROBLEM:
Honey adulteration is difficult for consumers to identify, while the origin and journey of honey through the supply chain are often unclear. The platform should combine quality verification, digital traceability, QR-based batch identification, and tamper-resistant records.

DESIGN DIRECTION:

* Professional agri-tech + food-safety visual language
* Clean, trustworthy and institutional
* White/off-white background
* Natural honey/amber accent colors used sparingly
* Dark green as a secondary color
* Subtle use of honeycomb geometry
* Rounded cards but NOT excessive glassmorphism
* Avoid futuristic neon effects
* Avoid excessive gradients
* Avoid generic AI-dashboard aesthetics
* Use realistic charts, tables, icons and process diagrams
* Strong typography and clear information hierarchy
* Responsive desktop-first design
* The website should look suitable for an SIH judging/demo environment

NAVIGATION:

Dashboard
Verify Honey
Traceability
Quality Analysis
Batches
Farmers
Reports

HOME / DASHBOARD:

Create a concise overview dashboard containing:

* Total Honey Batches
* Verified Batches
* Quality Tested
* Flagged Batches

Add a large “Verify Honey Batch” search/QR section.

Include a visual supply-chain flow:

Beekeeper → Harvest → Collection → Processing → Laboratory → Packaging → Distribution → Consumer

Each stage should have an icon, status and timestamp.

Add a section titled:
**“How HoneyTrace Works”**

Show 4 steps:

1. Register Honey Batch
2. Test Quality
3. Record Supply Chain
4. Consumer Verification

VERIFY HONEY PAGE:

Create a prominent verification interface.

Allow the user to:

* Enter Batch ID
* Scan/enter QR code
* Search for a batch

Example:

Batch ID:
HT-2026-MH-00421

After verification, display:

VERIFIED HONEY

Purity Status: PASS
Traceability: COMPLETE
Quality Test: VERIFIED
Source: Maharashtra
Harvest Date: 18 August 2026
Processing Unit: Maharashtra Honey Processing Centre

Create a visual authenticity score, but clearly label it as a platform assessment rather than an official certification.

Add a button:
**“View Complete Journey”**

QUALITY ANALYSIS PAGE:

Create a honey quality testing dashboard.

Display parameters such as:

Moisture
HMF
Reducing Sugars
Sucrose
Acidity
Diastase Activity

Use simple charts and status indicators.

Show an example result:

QUALITY STATUS
PASS

Create a section:
**“Adulteration Risk Analysis”**

Show:

Low Risk
Moderate Risk
High Risk

Explain each detected parameter with a simple status indicator.

Do NOT claim that the website itself performs laboratory testing. Clearly represent the feature as analysis of uploaded/entered laboratory test data.

TRACEABILITY PAGE:

Create an interactive horizontal/vertical timeline:

01 — Beekeeper
02 — Harvest
03 — Collection Centre
04 — Processing
05 — Laboratory Testing
06 — Packaging
07 — Distribution
08 — Consumer

Each step should display:

* Date
* Location
* Responsible entity
* Status
* Digital record ID

Include a “Digital Record” panel showing a shortened transaction/hash identifier.

BATCHES PAGE:

Create a searchable table containing:

Batch ID
Source
Harvest Date
Quality Status
Current Stage
Traceability
Status

Use realistic sample records.

Example:

HT-2026-MH-00421
Maharashtra
18 Aug 2026
PASS
Packaged
Complete
Verified

FARMER / BEEKEEPER PAGE:

Create a dashboard showing:

Registered Beekeepers
Active Honey Batches
Total Harvest
Verified Batches

Include beekeeper cards containing:

Name
Location
Number of hives
Active batches
Verification status

Add:
**Register New Batch**

ADMIN / AUTHORITY DASHBOARD:

Create a monitoring dashboard for authorities or platform administrators.

Show:

Total Registered Batches
Verified Batches
Flagged Batches
Pending Tests

Include:

* Bar chart of batches by month
* Geographic distribution
* Adulteration-risk summary
* Recent verification activity

Create an “Alerts” section for suspicious or incomplete records.

QR VERIFICATION:

Create a dedicated QR verification experience.

When a QR code is scanned, show:

HoneyTrace
Batch ID
Origin
Harvest Date
Quality Status
Traceability Status

Add a visual green verification indicator.

INTERACTION REQUIREMENTS:

The website should NOT be a collection of static mockup screens.

Implement functional interactions:

* Sidebar navigation
* Search batch
* Batch filtering
* Dashboard cards
* Interactive traceability timeline
* Quality parameter status changes
* QR verification simulation
* Modal for batch details
* Buttons that navigate to relevant pages
* Responsive layout

DEMO DATA:

Use realistic fictional demo data so the website can be demonstrated without requiring a backend.

Clearly label the system as a prototype/demo where appropriate.

IMPORTANT:
Do not fabricate government certification, laboratory certification, blockchain verification, or official FSSAI approval.

The platform should demonstrate how such a system could work.

TECHNICAL REQUIREMENTS:

Build the website so it can be deployed directly to Vercel.

Use:

* React
* Next.js
* Tailwind CSS
* Reusable components
* Responsive design
* Clean component structure
* No unnecessary dependencies

Create a polished sidebar dashboard layout.

The final result should feel like a real working **food-safety + agricultural traceability platform developed for Smart India Hackathon**, not like a generic AI-generated landing page.
