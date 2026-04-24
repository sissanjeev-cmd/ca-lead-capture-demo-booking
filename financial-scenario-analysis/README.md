# Financial Scenario Analysis System

An interactive, real-time financial scenario modeling platform for Chartered Accountants and financial consultants to simulate "what-if" scenarios and analyze the impact on financial statements.

## 🎯 Features

- **Interactive Scenario Builder** - Modify revenue, expenses, tax rates, depreciation, and more
- **Real-Time Calculations** - Instant recalculation of P&L, Balance Sheet, Cash Flow, and Tax
- **Scenario Versioning** - Create branches, compare versions, track changes
- **Multi-Statement Analysis** - Integrated view of all financial statements
- **Drill-Down Capability** - Trace impacts from summary statements to ledger details
- **Comparison Analytics** - Side-by-side scenario comparison with variance analysis
- **Data Import** - Load historical ledger data and create baselines
- **Export Capability** - Generate PDF/Excel reports with full analysis

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 16+ with App Router
- **UI Library**: React 19 with Tailwind CSS
- **State Management**: React hooks
- **Charts**: Recharts for financial visualizations
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Calculations**: Python (pandas, numpy)
- **Processing**: Python Shell integration
- **Data Validation**: Mongoose schema validation

### Database
- **MongoDB Collections**:
  - `companies` - Master company data and chart of accounts
  - `ledger_masters` - Historical transaction data
  - `scenarios` - Scenario definitions with calculations
  - `scenario_comparisons` - Comparison snapshots
  - `calculation_rules` - Financial statement rules

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone and setup**
```bash
cd financial-scenario-analysis

# Frontend
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000

# Backend (in new terminal)
cd backend
npm install
npm run dev
# Runs on http://localhost:4000

# Python dependencies
pip install -r backend/python/requirements.txt
```

2. **Configure environment**
```bash
# Backend .env
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB connection string

# Frontend .env.local
touch frontend/.env.local
# Add: NEXT_PUBLIC_API_URL=http://localhost:4000
```

3. **Setup MongoDB**
```bash
# Import schema in MongoDB Atlas shell
# Copy contents of mongodb-schema-setup.js and run in MongoDB shell
```

## 📖 Project Structure

```
financial-scenario-analysis/
├── frontend/                           # Next.js React frontend
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   │   ├── page.tsx               # Home page
│   │   │   ├── scenarios/             # Scenario pages
│   │   │   └── api/                   # Next.js API routes (optional)
│   │   ├── components/                # Reusable components
│   │   │   ├── scenarios/
│   │   │   │   ├── ScenarioList.tsx
│   │   │   │   ├── ScenarioForm.tsx
│   │   │   │   ├── VariableEditor.tsx
│   │   │   │   ├── StatementViewer.tsx
│   │   │   │   └── ComparisonMatrix.tsx
│   │   │   └── common/
│   │   └── styles/                    # Global styles
│   └── package.json
│
├── backend/                           # Express.js backend
│   ├── server.js                      # Main server
│   ├── routes/
│   │   ├── scenarios.js               # Scenario endpoints
│   │   └── calculations.js            # Calculation endpoints
│   ├── python/
│   │   ├── calculator.py              # Statement calculations
│   │   └── requirements.txt
│   ├── outputs/                       # Generated reports
│   ├── .env.example
│   └── package.json
│
├── SCENARIO_ANALYSIS_DESIGN.md        # Complete design document
├── mongodb-schema-setup.js            # Database schema initialization
└── README.md                          # This file

```

## 📋 API Reference

### Scenarios Endpoints

```http
GET /api/scenarios?companyId=X&limit=20&skip=0
```
Fetch all scenarios for a company.

```http
POST /api/scenarios
```
Create new scenario.
```json
{
  "companyId": "...",
  "scenarioName": "FY25 Reforecast",
  "baselineRef": "...",
  "description": "Mid-year reforecast"
}
```

```http
GET /api/scenarios/:scenarioId
```
Fetch scenario details with calculated statements.

```http
PUT /api/scenarios/:scenarioId
```
Update scenario variables and recalculate.
```json
{
  "variables": {
    "revenue_adjustments": [...],
    "expense_adjustments": [...]
  }
}
```

### Calculations Endpoints

```http
POST /api/calculate/statements
```
Trigger financial statement recalculation.

```http
POST /api/calculate/tax
```
Calculate tax liability based on income.

```http
GET /api/impact-analysis/:scenarioId
```
Get variable-level impact breakdown.

## 🔄 Data Model

### Scenario Document
```javascript
{
  _id: ObjectId,
  company_id: ObjectId,
  scenario_name: "FY25 Reforecast",
  scenario_type: "forecast",
  baseline_ref: ObjectId,
  
  variables: {
    revenue_adjustments: [
      {
        account_id: "4000",
        base_value: 1000000,
        adjusted_value: 950000,
        change_percentage: -5
      }
    ],
    expense_adjustments: [...],
    tax_variables: [...]
  },
  
  calculated_statements: {
    profit_loss: { /* P&L data */ },
    balance_sheet: { /* BS data */ },
    cash_flow: { /* CF data */ },
    tax_summary: { /* Tax data */ }
  },
  
  status: "draft",
  created_at: ISODate(),
  created_by: "email@example.com"
}
```

## 🧮 Calculation Flow

1. **Load Baseline**: Fetch baseline scenario or import historical data
2. **Apply Variables**: Adjust revenue, expenses, tax rates, etc.
3. **Recalculate P&L**: Revenue → Expenses → EBIT → EBT → Net Profit
4. **Update Other Statements**: Cash Flow, Balance Sheet based on P&L changes
5. **Calculate Tax**: Apply tax rules and surcharges
6. **Validate**: Ensure balance sheet balances
7. **Cache Results**: Store in MongoDB
8. **Return**: Send calculated statements to frontend

## 📊 Workflow Example: Mid-Year Reforecast

1. **Create Scenario**
   - Name: "FY25 Mid-Year Reforecast"
   - Based on: FY25 Budget (Baseline)

2. **Adjust Variables**
   - Revenue down 5% (market slowdown)
   - Salaries up 10% (annual hike)
   - Tax rate up to 32%

3. **Review Impact**
   - Net Profit: -₹151k (-5%)
   - Tax Liability: +₹14k
   - Waterfall visualization

4. **Compare**
   - Side-by-side with Budget
   - Variance analysis
   - Key metrics highlighted

5. **Export**
   - PDF report with all statements
   - Change log and rationale
   - Drill-down details

## 🔧 Development

### Running Locally

**Terminal 1 - Frontend**:
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 3 - Monitor** (optional):
```bash
# Check API health
curl http://localhost:4000/health
```

### Testing

Backend calculation:
```bash
echo '{
  "type": "pl_statement",
  "payload": {
    "ledger_data": {"revenue": 1000000, "cogs": 500000},
    "variables": {}
  }
}' | python3 backend/python/calculator.py
```

### Build for Production

```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd backend
npm run build:prod
NODE_ENV=production npm start
```

## 📚 Design Documentation

See `SCENARIO_ANALYSIS_DESIGN.md` for:
- Complete system architecture
- Database schema details
- UI/UX component specifications
- Workflow walkthroughs
- Implementation roadmap
- MongoDB indexes and patterns
- Performance optimization strategies

## 🔐 Environment Variables

**Backend (.env)**:
```
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=financial-scenario-analysis
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
PYTHON_PATH=python3
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📦 Dependencies

**Frontend**:
- next: ^16.0.0
- react: ^19.0.0
- tailwindcss: ^3.x
- axios: ^1.6.0
- recharts: ^2.8.0 (for charts)

**Backend**:
- express: ^4.18.2
- mongoose: ^8.0.0
- dotenv: ^16.3.1
- python-shell: ^5.0.0

**Python**:
- pymongo: ^4.5.0
- pandas: ^2.0.3
- numpy: ^1.24.3
- openpyxl: ^3.1.2

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm install -g vercel
cd frontend
vercel
```

### Backend (Render, Railway, etc.)
- Set `NODE_ENV=production`
- Provide MongoDB connection string
- Set `FRONTEND_URL` to frontend domain

## 📝 License

MIT

## 🤝 Contributing

1. Create feature branches from `main`
2. Follow ESLint rules
3. Write tests for new features
4. Create pull requests with clear descriptions

## 📞 Support

For issues or questions, refer to:
- `SCENARIO_ANALYSIS_DESIGN.md` - System architecture and design
- `.github/copilot-instructions.md` - Development workflow
- Backend route files - Implementation examples

---

**Version**: 1.0.0  
**Last Updated**: April 15, 2026
