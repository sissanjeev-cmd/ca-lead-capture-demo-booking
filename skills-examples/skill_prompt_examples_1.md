# Practical Skill Invocation Examples
## Real Prompts → Skills Triggered

---

## 1. DOCUMENT CREATION SKILLS

### Example 1: Professional Report with Branding
**Your Prompt:**
```
"Create a professional quarterly business report in Word format. 
Include our company logo, brand colors (navy and gold), 
a table of contents, and charts showing revenue trends."
```

**Skills Triggered:**
- ✅ **docx** - Creates Word document with formatting
- ✅ **my-logo-theme** - Applies company branding
- ✅ **xlsx** (implicit) - Handles the data/charts

**Why:** You asked for "Word format" (→ docx) + "company logo and colors" (→ my-logo-theme)

---

### Example 2: Simple Letter Template
**Your Prompt:**
```
"Write a professional cover letter in Word that I can customize"
```

**Skills Triggered:**
- ✅ **docx** - Creates the Word template

**Why:** "in Word" = docx skill needed. No branding mentioned, so my-logo-theme not triggered.

---

### Example 3: Branded Memo
**Your Prompt:**
```
"Create a company memo using our my-logo-theme brand standards with 
our signature colors and logo at the top"
```

**Skills Triggered:**
- ✅ **docx** - Creates the document
- ✅ **my-logo-theme** - Applies brand formatting explicitly requested

**Why:** Explicit mention of "my-logo-theme" + "our brand standards"

---

## 2. PRESENTATION SKILLS

### Example 4: Conference Pitch Deck
**Your Prompt:**
```
"Create a 10-slide presentation for our product launch. 
Make it visually stunning with our brand colors, logo, and professional design."
```

**Skills Triggered:**
- ✅ **pptx** - Creates PowerPoint presentation
- ✅ **my-logo-theme** - Applies company branding
- ✅ **theme-factory** (implicit) - Professional design patterns

**Why:** "presentation" (→ pptx) + "brand colors, logo" (→ my-logo-theme) + "visually stunning" (→ theme-factory)

---

### Example 5: Investor Pitch with Specific Theme
**Your Prompt:**
```
"Use the pptx skill to build an investor pitch deck. 
Apply the 'Tech Innovation' theme from theme-factory to make it modern and bold."
```

**Skills Triggered:**
- ✅ **pptx** - Explicitly requested
- ✅ **theme-factory** - Explicitly requested with specific theme name

**Why:** You directly named both skills

---

### Example 6: Sales Training Presentation
**Your Prompt:**
```
"Make a 5-slide training presentation about our Q3 sales strategy. 
Use professional colors and keep it clean and minimal."
```

**Skills Triggered:**
- ✅ **pptx** - Creates slides
- ✅ **theme-factory** - "professional colors" and "clean and minimal" suggests Modern Minimalist theme

**Why:** Natural language triggers theme-factory for styling

---

## 3. SPREADSHEET & DATA SKILLS

### Example 7: Convert CSV to Spreadsheet with Analysis
**Your Prompt:**
```
"I have a customer data CSV file. Convert it to Excel, 
clean up the formatting, and add a summary dashboard with charts."
```

**Skills Triggered:**
- ✅ **xlsx** - Reads CSV, creates spreadsheet
- ✅ **chart** (implicit) - Creates the dashboard visualizations

**Why:** "Excel" + "CSV file" (→ xlsx) + "charts" (→ chart skill)

---

### Example 8: Budget Spreadsheet Template
**Your Prompt:**
```
"Create a budget tracking spreadsheet in Excel with formulas for 
monthly totals, category breakdowns, and a visual chart."
```

**Skills Triggered:**
- ✅ **xlsx** - Creates the spreadsheet with formulas
- ✅ **chart** (implicit) - Adds the visual chart

**Why:** "Excel spreadsheet" + "chart"

---

### Example 9: Branded Financial Report
**Your Prompt:**
```
"Create an Excel budget report with our company theme applied. 
Use our brand colors and logo in the header."
```

**Skills Triggered:**
- ✅ **xlsx** - Creates the spreadsheet
- ✅ **my-logo-theme** - Applies branding

**Why:** "Excel" (→ xlsx) + "company theme, brand colors, logo" (→ my-logo-theme)

---

## 4. WEB & UI SKILLS

### Example 10: Boutique E-Commerce Store
**Your Prompt:**
```
"Design a luxury jewelry store website with product galleries, 
shopping cart, and a beautiful checkout experience."
```

**Skills Triggered:**
- ✅ **boutique** - Creates complete e-commerce website
- ✅ **frontend-design** (implicit) - High-quality UI design

**Why:** "luxury jewelry store website" matches boutique skill description perfectly

---

### Example 11: Apply Theme to Website
**Your Prompt:**
```
"I already have a basic boutique website. Apply the 'Desert Rose' theme 
from theme-factory to give it a sophisticated, dusty-tone aesthetic."
```

**Skills Triggered:**
- ✅ **theme-factory** - Applies the specific theme to existing site
- ✅ **boutique** (implicit) - Already have the website

**Why:** Explicitly asking to apply a theme-factory theme

---

### Example 12: Interactive Dashboard
**Your Prompt:**
```
"Build an interactive sales dashboard where users can filter by region, 
see KPIs, and view trends with charts and visualizations."
```

**Skills Triggered:**
- ✅ **frontend-design** - Creates the UI/dashboard layout
- ✅ **chart** - Creates the visualizations and KPI displays
- ✅ **web-artifacts-builder** (implicit) - For complex interactive components

**Why:** "interactive dashboard" with "charts" and "KPIs"

---

### Example 13: Branded Landing Page
**Your Prompt:**
```
"Create a landing page for our SaaS product launch with our my-logo-theme 
branding, testimonials section, pricing table, and signup form."
```

**Skills Triggered:**
- ✅ **boutique** OR **frontend-design** - Creates the landing page
- ✅ **my-logo-theme** - Applies company branding
- ✅ **web-artifacts-builder** (implicit) - For complex form components

**Why:** "landing page" (→ boutique/frontend-design) + "my-logo-theme branding"

---

## 5. PDF SKILLS

### Example 14: Create PDF Report
**Your Prompt:**
```
"Generate a PDF invoice template with our company logo, 
branding, and a professional layout that clients can download."
```

**Skills Triggered:**
- ✅ **pdf** - Creates and formats the PDF
- ✅ **my-logo-theme** - Applies logo and branding

**Why:** "PDF" + "company logo, branding"

---

### Example 15: Process Existing PDF
**Your Prompt:**
```
"I have a scanned PDF document that's not searchable. 
Run OCR on it to make it text-searchable, then extract the key data."
```

**Skills Triggered:**
- ✅ **pdf** - OCR processing
- ✅ **pdf-reading** (implicit) - Data extraction and analysis

**Why:** "scanned PDF" + "OCR" + "extract data"

---

### Example 16: Merge Multiple PDFs
**Your Prompt:**
```
"Combine these 5 PDF reports into one document, add a branded cover page 
with our logo, and create a table of contents."
```

**Skills Triggered:**
- ✅ **pdf** - Merges PDFs, adds cover page
- ✅ **my-logo-theme** - Branded cover page

**Why:** "combine PDFs" (→ pdf) + "branded cover page, logo" (→ my-logo-theme)

---

## 6. AUTOMATION & CUSTOM SKILLS

### Example 17: Build a Custom Skill
**Your Prompt:**
```
"I want to create a new skill that automatically pulls data from 
my Salesforce account and generates weekly reports. 
Can you help me build that?"
```

**Skills Triggered:**
- ✅ **skill-creator** - Creates the custom skill
- ✅ **dbs-framework** - Provides the structure (Direction, Blueprints, Solutions)

**Why:** "create a new skill" explicitly triggers skill-creator + dbs-framework

---

### Example 18: Build Workflow Framework
**Your Prompt:**
```
"I need to automate our content creation process. 
Help me structure a workflow for writing, editing, and publishing blog posts."
```

**Skills Triggered:**
- ✅ **dbs-framework** - Structures the automation using DBS framework
- ✅ **skill-creator** (implicit) - Might create a custom skill from the framework

**Why:** "automate" + "structure a workflow"

---

## 7. MULTI-SKILL COMBINATIONS

### Example 19: Complete Marketing Campaign Package
**Your Prompt:**
```
"Create a complete marketing campaign package:
1. A 5-slide presentation pitching the campaign
2. A one-page Word summary with our branding
3. An Excel spreadsheet tracking metrics
4. A landing page to promote the campaign

Use our company colors and logo throughout."
```

**Skills Triggered:**
- ✅ **pptx** - Creates the presentation
- ✅ **docx** - Creates the summary document
- ✅ **xlsx** - Creates the metrics tracker
- ✅ **boutique** OR **frontend-design** - Creates the landing page
- ✅ **my-logo-theme** - Applied to ALL documents for consistent branding
- ✅ **chart** (implicit) - For the metrics dashboard

**Why:** Multiple document types + branding request = multiple skills working together

---

### Example 20: Complete E-Commerce Platform
**Your Prompt:**
```
"Build a complete e-commerce store:
- Beautiful website with product gallery (use boutique skill)
- Apply the Sunset Boulevard theme for warm, inviting aesthetic
- Create an Excel spreadsheet for inventory management
- Generate a PDF packing slip template for orders"
```

**Skills Triggered:**
- ✅ **boutique** - E-commerce website
- ✅ **theme-factory** - Sunset Boulevard theme applied
- ✅ **xlsx** - Inventory management
- ✅ **pdf** - Packing slip template
- ✅ **my-logo-theme** (implicit) - If you mention company branding

**Why:** Complete ecosystem = multiple specialized skills

---

## 8. EDGE CASES & CLARIFICATIONS

### Example 21: Ambiguous Request That Needs Clarification
**Your Prompt:**
```
"Create a report for me"
```

**Skills Triggered:**
- ❓ UNCLEAR - Could be docx, pptx, pdf, or web artifact
- 🔄 **Claude's Response:** "What format would you like the report in? 
  Word document, PowerPoint, PDF, or an interactive web page?"

**Why:** Report could mean many things - need clarification

---

### Example 22: Explicit Skill Override
**Your Prompt:**
```
"Actually, don't use the pptx skill for this. 
I want to use the web-artifacts-builder skill instead to create 
an interactive presentation I can share online."
```

**Skills Triggered:**
- ✅ **web-artifacts-builder** - Your explicit override takes precedence
- ❌ **pptx** - Overridden by your request

**Why:** You explicitly redirected to a different skill

---

### Example 23: Check if Skill is Needed
**Your Prompt:**
```
"Do I need a special skill to create a simple HTML form?"
```

**Skills Triggered:**
- ✅ **frontend-design** - Creates clean, professional HTML forms
- (But not always required - simple forms can be created without a skill)

**Why:** Complex forms = frontend-design. Simple forms = might not need a skill.

---

## 9. TRIGGER KEYWORDS CHEAT SHEET

Here are words that automatically trigger specific skills:

### Document Skills
| Keyword | Skill Triggered |
|---------|-----------------|
| "Word document", ".docx", "professional letter" | **docx** |
| "presentation", "slide deck", ".pptx" | **pptx** |
| "PDF", ".pdf", "invoice" | **pdf** |
| "Excel", "spreadsheet", ".xlsx", "data" | **xlsx** |

### Web & UI Skills
| Keyword | Skill Triggered |
|---------|-----------------|
| "website", "boutique", "store", "shop" | **boutique** |
| "UI", "dashboard", "interactive", "component" | **frontend-design** |
| "chart", "graph", "visualization", "data viz" | **chart** |
| "landing page", "web page", "React" | **web-artifacts-builder** |

### Branding Skills
| Keyword | Skill Triggered |
|---------|-----------------|
| "brand colors", "logo", "company branding" | **my-logo-theme** |
| "professional colors", "theme", "aesthetic" | **theme-factory** |
| "Anthropic brand", "company identity" | **brand-guidelines** |

### Automation Skills
| Keyword | Skill Triggered |
|---------|-----------------|
| "create a skill", "build automation" | **skill-creator** |
| "workflow", "structure", "framework" | **dbs-framework** |

---

## 10. REAL WORKFLOW EXAMPLES

### Workflow A: Freelancer Creating Client Deliverables
```
Day 1: "Create a proposal document in Word with our branding"
→ docx + my-logo-theme

Day 2: "Make a pitch presentation for the client meeting"
→ pptx + theme-factory (Ocean Depths theme)

Day 3: "Build a landing page to showcase the work"
→ boutique + my-logo-theme

Day 4: "Generate a final report PDF with all deliverables listed"
→ pdf + my-logo-theme
```

---

### Workflow B: Startup Product Launch
```
Week 1: "Create investor pitch deck"
→ pptx + my-logo-theme + theme-factory

Week 2: "Build product landing page"
→ boutique + my-logo-theme

Week 3: "Make customer testimonials page with interactive elements"
→ web-artifacts-builder + frontend-design

Week 4: "Create email campaign graphics (as PDF)"
→ pdf + my-logo-theme
```

---

## KEY TAKEAWAYS

✅ **Natural Language Works Best**: Describe what you want, Claude picks the skills
✅ **Multiple Skills Stack**: One request can trigger 2-5 skills working together
✅ **Branding Multiplier**: Adding "with our branding/colors/logo" triggers my-logo-theme
✅ **Be Specific**: "Luxury jewelry website" → boutique | "Simple site" → frontend-design
✅ **You Can Override**: Ask for a specific skill by name if you know what you want
✅ **Keywords Matter**: Certain words automatically trigger certain skills
✅ **Ask for Clarification**: Ambiguous requests get clarified before skills are used

