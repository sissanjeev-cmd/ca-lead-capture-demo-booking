# Financial Scenario Analysis System - Design Document

## System Overview

An interactive, real-time financial scenario modeling platform that allows Chartered Accountants to simulate "what-if" scenarios, track impacts on financial statements, and compare multiple scenarios against baselines.

---

## 1. SYSTEM ARCHITECTURE

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js/React)                 │
│  ┌─────────────┬──────────────────┬──────────────────────┐  │
│  │Dashboard    │Scenario Builder  │Financial Statements │  │
│  │& Explorer   │& Variables       │& Comparisons        │  │
│  └────┬────────┴────────┬─────────┴──────────┬───────────┘  │
│       │                 │                    │               │
└───────┼─────────────────┼────────────────────┼───────────────┘
        │                 │                    │
        │    Next.js API Routes (Edge)        │
        │    - /api/scenarios                 │
        │    - /api/calculations              │
        │    - /api/statements                │
        │                 │                    │
┌───────┼─────────────────┼────────────────────┼───────────────┐
│       │                 │                    │               │
│  ┌────▼─────────────────▼────────────────────▼──────────────┐│
│  │                  BACKEND (Node.js/Express)              ││
│  │  ┌──────────────┬──────────────┬────────────────────┐  ││
│  │  │Scenario      │Statement     │Comparison &      │  ││
│  │  │Manager       │Calculator    │Export Service    │  ││
│  │  │& Versioning  │& Rules Engine│                  │  ││
│  │  └──────────────┴──────────────┴────────────────────┘  ││
│  │  ┌──────────────────────────────────────────────────┐  ││
│  │  │Python Finance Module                             │  ││
│  │  │- Ledger Processing, Tax Calculations, Audit      │  ││
│  │  │- Impact Analysis & Report Generation             │  ││
│  │  └──────────────────────────────────────────────────┘  ││
│  └──────────────────────────────────────────────────────────┘│
│       │                                                      │
└───────┼──────────────────────────────────────────────────────┘
        │
        │ (MongoDB Driver)
        │
┌───────▼──────────────────────────────────────────────────────┐
│                  MONGODB ATLAS                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │Scenarios │ Ledgers │ Rules │ Companies │ Results │  │
│  │Baseline  │ Accounts│ Tax   │ Masters   │ Cache   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 1.2 Core Services

| Service                     | Responsibility                                          |
|-----------------------------|-------------------------------------------------------|
| **ScenarioManager**         | CRUD scenarios, versioning, baseline management       |
| **CalculationEngine**       | Real-time ledger recalculation, tax rules evaluation  |
| **StatementGenerator**      | P&L, Balance Sheet, Cash Flow statement generation    |
| **ComparisonService**       | Variance analysis, scenario comparison, drill-down    |
| **DataImportService**       | Historical data import, baseline creation             |
| **ExportService**           | Report generation (PDF/Excel), API exports            |

---

## 2. DATA MODEL & SCHEMA DESIGN

### 2.1 Core Collections

#### **companies** Collection
```javascript
{
  _id: ObjectId,
  name: "Acme Corp",
  fiscal_year: 2025,
  fiscal_year_end: "2025-03-31",
  
  // Master financial structure - embedded for performance
  chart_of_accounts: [
    {
      account_id: "1000",               // Asset
      account_name: "Cash",
      account_type: "asset",
      account_group: "current_assets",
      is_control_account: false,
      default_debit_or_credit: "debit"
    },
    // ... hundreds of accounts
  ],
  
  // Tax rules - embedded, accessed with every calculation
  tax_rules: {
    income_tax_rate: 30,
    surcharge_rate: 12,
    cess_rate: 4,
    depreciation_method: "wdv",          // WDV or SL
    depreciation_rates: {
      building: 5,
      plant: 15,
      computer: 40
    },
    provisioning_rules: [
      { name: "bad_debt_reserve", rate: 0.05, applicable_to: "receivables" },
      { name: "inventory_reserve", rate: 0.02, applicable_to: "inventory" }
    ]
  },

  created_at: ISODate(),
  updated_at: ISODate()
}
```

#### **ledger_masters** Collection (Reference Data)
```javascript
{
  _id: ObjectId,
  company_id: ObjectId,
  fiscal_year: 2025,
  
  // Actual historical ledger balances
  account_balances: [
    {
      account_id: "1000",
      account_name: "Cash",
      opening_balance: 50000,
      current_balance: 145000,        // Updated as scenarios roll down
      is_master_balance: true          // Mark historical baseline
    }
  ],
  
  // Detailed transactions for drill-down
  transactions: [
    {
      voucher_id: "JV001",
      date: ISODate("2025-01-15"),
      description: "Opening Balance",
      account_id: "1000",
      debit: 50000,
      credit: 0,
      row_index: 0
    }
  ],
  
  source_file: "tally_export.xlsx",     // Audit trail
  import_date: ISODate(),
  import_user: "ca@company.com",
  
  created_at: ISODate(),
  updated_at: ISODate()
}
```

#### **scenarios** Collection (Core - Document Versioning Pattern)
```javascript
{
  _id: ObjectId,
  company_id: ObjectId,
  fiscal_year: 2025,
  
  // Scenario Metadata
  scenario_name: "FY25 Mid-Year Reforecast",
  scenario_type: "forecast",             // baseline | forecast | sensitivity | historical
  description: "Revised projections after Q1 results",
  
  baseline_ref: null,                    // null if this IS the baseline
                                         // ObjectId reference otherwise
  parent_scenario_id: ObjectId,          // For versioning - what scenario did this branch from?
  scenario_version: 2,                   // Version number for this branch
  
  // Variables Modified (relative to baseline)
  variables: {
    // Revenue adjustments
    revenue_adjustments: [
      {
        account_id: "4000",
        variable_name: "Revenue-Product-A",
        base_value: 1000000,
        adjusted_value: 950000,          // 5% reduction
        change_type: "absolute",         // or "percent"
        change_percentage: -5,
        change_amount: -50000,
        rationale: "Market downturn expectations",
        effective_date: ISODate("2025-01-01")
      },
      // ... more adjustments
    ],
    
    // Expense adjustments
    expense_adjustments: [
      {
        account_id: "5100",
        variable_name: "Salaries-Expense",
        base_value: 300000,
        adjusted_value: 330000,          // 10% increase
        change_type: "percent",
        change_percentage: 10,
        change_amount: 30000,
        rationale: "Annual salary hike",
        effective_date: ISODate("2025-04-01")
      }
    ],
    
    // Tax variable adjustments
    tax_variables: [
      {
        variable_name: "income_tax_rate",
        base_value: 30,
        adjusted_value: 32,
        rationale: "Expected tax rate increase"
      }
    ],
    
    // Other adjustments
    other_variables: [
      {
        variable_name: "depreciation_rate_building",
        base_value: 5,
        adjusted_value: 6,
        reason: "Changed to higher rate"
      }
    ]
  },
  
  // Calculated Financial Statements (Computed Pattern)
  calculated_statements: {
    profit_loss: {
      total_revenue: 9500000,
      total_expenses: 5280000,
      ebit: 4220000,
      finance_cost: 150000,
      ebt: 4070000,
      income_tax: 1221000,
      net_profit: 2849000,
      
      // Breakdown
      segments: [
        {
          segment_name: "Product-A",
          revenue: 950000,
          expenses: 280000,
          ebit: 670000
        }
      ]
    },
    
    balance_sheet: {
      assets: {
        current_assets: {
          cash: 145000,
          receivables: 850000,
          inventory: 420000,
          other: 50000,
          total: 1465000
        },
        non_current_assets: {
          property_plant_equipment: 2000000,
          less_accumulated_depreciation: -300000,
          net_ppe: 1700000,
          intangibles: 50000,
          total: 1750000
        },
        total_assets: 3215000
      },
      liabilities: {
        current_liabilities: {
          payables: 480000,
          short_term_borrowing: 200000,
          provisions: 50000,
          total: 730000
        },
        non_current_liabilities: {
          long_term_debt: 600000,
          deferred_tax: 40000,
          total: 640000
        },
        total_liabilities: 1370000
      },
      equity: {
        share_capital: 1000000,
        reserves: 845000,
        total_equity: 1845000
      },
      total_liabilities_equity: 3215000
    },
    
    cash_flow: {
      operating_activities: 1200000,
      investing_activities: -300000,
      financing_activities: -200000,
      net_cash_flow: 700000,
      opening_balance: 145000,
      closing_balance: 845000
    },
    
    tax_summary: {
      gross_profit: 4500000,
      taxable_income: 4070000,
      income_tax: 1221000,
      surcharge: 146520,
      cess: 48840,
      total_tax: 1416360,
      effective_tax_rate: 34.8
    }
  },
  
  // Metadata
  created_by: "ca@company.com",
  created_at: ISODate(),
  last_modified_by: "ca@company.com",
  last_modified_at: ISODate(),
  
  status: "draft",                       // draft | finalized | archived
  tags: ["reforecast", "conservative"],
  
  // For quick queries
  is_baseline: false,
  is_locked: false
}
```

#### **scenario_comparisons** Collection
```javascript
{
  _id: ObjectId,
  company_id: ObjectId,
  fiscal_year: 2025,
  
  comparison_name: "Base vs Reforecast vs Optimistic",
  
  // Reference multiple scenarios for comparison
  scenarios: [
    {
      scenario_id: ObjectId,             // Baseline
      scenario_name: "FY25 Budget (Baseline)",
      position: 1
    },
    {
      scenario_id: ObjectId,             // Reforecast
      scenario_name: "FY25 Mid-Year Reforecast",
      position: 2
    },
    {
      scenario_id: ObjectId,             // Optimistic
      scenario_name: "FY25 Optimistic Case",
      position: 3
    }
  ],
  
  // Variance Analysis (Computed)
  variance_analysis: {
    revenue: [
      { scenario_position: 1, value: 10000000, label: "Budget" },
      { scenario_position: 2, value: 9500000,  label: "Reforecast", variance_vs_1: -500000, variance_pct: -5 },
      { scenario_position: 3, value: 11000000, label: "Optimistic", variance_vs_1: 1000000, variance_pct: 10 }
    ],
    net_profit: [
      { scenario_position: 1, value: 3000000, label: "Budget" },
      { scenario_position: 2, value: 2849000, label: "Reforecast", variance_vs_1: -151000, variance_pct: -5.03 },
      { scenario_position: 3, value: 3300000, label: "Optimistic", variance_vs_1: 300000, variance_pct: 10 }
    ]
    // ... more metrics
  },
  
  created_at: ISODate(),
  updated_at: ISODate(),
  created_by: "ca@company.com"
}
```

#### **calculation_rules** Collection (Reference)
```javascript
{
  _id: ObjectId,
  company_id: ObjectId,
  
  // Mapping which accounts roll up to which statement lines
  pl_statement_mapping: [
    {
      line_item: "Total Revenue",
      formula: "sum(accounts: [4000, 4001, 4002])",
      accounts: ["4000", "4001", "4002"],
      calculation_type: "sum"
    },
    {
      line_item: "Cost of Goods Sold",
      formula: "sum(accounts: [5000, 5001]) + depreciation",
      accounts: ["5000", "5001"],
      plus_calculated: ["depreciation"],
      calculation_type: "sum"
    },
    {
      line_item: "Gross Profit",
      formula: "Total Revenue - COGS",
      derived_from: ["Total Revenue", "Cost of Goods Sold"],
      calculation_type: "formula"
    }
  ],
  
  bs_statement_mapping: [
    {
      line_item: "Cash",
      accounts: ["1000"],
      classification: "current_asset"
    }
  ],
  
  tax_calculation_rules: [
    {
      rule_id: "income_tax",
      formula: "taxable_income * tax_rate",
      depends_on: ["taxable_income", "tax_rate"]
    }
  ],
  
  depreciation_rules: [
    {
      asset_category: "building",
      method: "wdv",
      rate: 5,
      applicable_accounts: ["1500"]
    }
  ]
}
```

---

## 3. BACKEND API DESIGN

### 3.1 Key API Endpoints

#### **Scenario Management**
- `POST /api/scenarios` - Create new scenario
- `GET /api/scenarios/:scenarioId` - Fetch scenario details
- `PUT /api/scenarios/:scenarioId` - Update variables
- `DELETE /api/scenarios/:scenarioId` - Archive scenario
- `GET /api/scenarios/company/:companyId` - List all scenarios
- `POST /api/scenarios/:scenarioId/version` - Create new version

#### **Real-Time Calculations**
- `POST /api/calculate/statements` - Recalculate all statements
- `GET /api/statements/:scenarioId` - Get P&L, Balance Sheet, Cash Flow
- `POST /api/calculate/tax` - Calculate tax impact
- `GET /api/impact-analysis/:scenarioId` - Get variable impact breakdown

#### **Comparison & Analysis**
- `POST /api/compare` - Compare multiple scenarios
- `GET /api/comparisons/:companyId` - List saved comparisons
- `GET /api/drill-down/:scenarioId/:accountId` - Drill to ledger details

#### **Data Management**
- `POST /api/import/ledger` - Import historical ledger
- `POST /api/baseline/create` - Create baseline from import
- `GET /api/export/:scenarioId/pdf` - Export as PDF
- `GET /api/export/:scenarioId/excel` - Export as Excel

### 3.2 Real-Time Calculation Flow

```javascript
// Backend: backend/routes/scenarios.js (new file)
POST /api/calculate/statements
Input: {
  scenario_id: ObjectId,
  variables: { /* changes */ }
}

Flow:
1. Load baseline scenario data
2. Apply variables modifications
3. Recalculate:
   - Line items (sum/formula)
   - Tax calculations
   - Depreciation
   - Provisions
4. Cascade updates (P&L → Tax → Balance Sheet → Cash Flow)
5. Cache results in DB
6. Return calculated statements + metadata
7. Emit progress via WebSocket/SSE (optional for large scenarios)

Output: {
  profit_loss: { /* calculated */ },
  balance_sheet: { /* calculated */ },
  cash_flow: { /* calculated */ },
  tax_summary: { /* calculated */ },
  warnings: ["Depreciation exceeds asset value"],
  calculation_time_ms: 145
}
```

---

## 4. FRONTEND ARCHITECTURE

### 4.1 Component Structure

```
frontend/pages/modules/
├── scenario-analysis/
│   ├── dashboard.js              # Home page with scenario list
│   ├── scenario-builder.js        # Create/edit scenarios
│   ├── variable-editor.js         # Modify specific variables
│   ├── viewer.js                  # View calculated statements
│   └── comparison.js              # Compare scenarios
│
frontend/components/scenarios/
├── ScenarioList.js               # List with filters & search
├── ScenarioForm.js               # Create/edit form
├── VariableAdjustmentPanel.js    # Revenue/Expense/Tax sliders
├── StatementViewer.js            # P&L, BS, CF with drill-down
├── ComparisonTable.js            # Side-by-side comparison
├── VarianceChart.js              # Waterfall/tornado charts
└── ExportButton.js               # PDF/Excel export
```

### 4.2 Key UI Features

#### **Dashboard View**
- Scenario list with status badges
- Quick filters: Baseline, Forecasts, Comparison Mode
- Recent scenarios pinned
- "New Scenario" button prominently displayed

#### **Scenario Builder Widget**
```
┌─────────────────────────────────────┐
│ Scenario: FY25 Reforecast v2        │
│ Baseline: FY25 Budget (Baseline)    │
├─────────────────────────────────────┤
│ Revenue Adjustments                 │
│ ┌─────────────────────────────────┐ │
│ │ Product-A Revenue               │ │
│ │ Base: ₹1,000,000                │ │
│ │ [-] [₹950,000] [+]  [-5%]       │ │
│ │ Change: ₹-50,000                │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Expense Adjustments             │ │
│ │  Salaries: ₹330,000 [+10%]      │ │
│ │  Marketing: ₹180,000 [-15%]     │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Tax Rate Adjustments            │ │
│ │  Income Tax: 32% [↑ from 30%]   │ │
│ └─────────────────────────────────┘ │
│         [Calculate] [Save] [Compare] │
└─────────────────────────────────────┘
```

#### **Financial Statement Viewer**
- **P&L Statement**: Revenue → EBIT → EBT → Net Profit
- **Balance Sheet**: Assets | Liabilities & Equity
- **Cash Flow**: Operating → Investing → Financing
- **Tax Summary**: Income Tax, Surcharge, Cess breakdown
- Drill-down from summary to ledger transactions

#### **Comparison Matrix**
```
                  Budget      Reforecast    Variance    %
Revenue         ₹10,000k     ₹9,500k      ₹-500k      -5%
COGS            ₹5,000k      ₹5,100k      ₹+100k       2%
Gross Profit    ₹5,000k      ₹4,400k      ₹-600k     -12%
...
Net Profit      ₹3,000k      ₹2,849k      ₹-151k      -5%
```

---

## 5. WORKFLOW EXAMPLES

### 5.1 Typical Workflow: Mid-Year Reforecast

**Step 1: Create Scenario**
```
User clicks "New Scenario"
- Name: "FY25 Mid-Year Reforecast"
- Baseline: "FY25 Budget"
- Type: Forecast
→ System creates new empty scenario document
```

**Step 2: Input Variable Changes**
```
User navigates to variable adjustment panel:
- Reduces "Revenue-Product-A" by 5% (market downturn)
- Increases "Salaries" by 10% (salary hike effective April)
- Updates "Income Tax Rate" from 30% to 32%
- Adds note rationale: "Based on Q1 actuals"

→ Real-time calculation triggered
→ Backend applies rules, recalculates all statements
→ Frontend displays updated P&L, BS, CF instantly
```

**Step 3: Review & Compare**
```
User views statement viewer:
- P&L shows Net Profit: ₹2,849k (vs ₹3,000k baseline)
- User clicks "Compare with Baseline"
- Side-by-side comparison shows ₹-151k variance (-5%)
- Waterfall chart visualizes impact pathway
```

**Step 4: Drill-Down**
```
User clicks on "Salaries Expense" line (increased by ₹30k)
→ Frontend requests drill-down data
→ Backend returns ledger-level breakdown:
  - Employee-A Salary: ₹150k → ₹165k
  - Employee-B Salary: ₹80k → ₹88k
  - Contractor Cost: ₹70k → ₹77k
  (Shows details with effective dates)
```

**Step 5: Save & Finalize**
```
User clicks "Finalize Scenario"
→ Status: draft → finalized
→ Scenario locked for editing (versioning)
→ Can still create child scenarios from this point
```

**Step 6: Export Report**
```
User clicks "Export as PDF"
→ Backend generates PDF:
  - Cover page: Scenario metadata
  - Executive summary: Key P&L metrics
  - Full statements (P&L, BS, CF, Tax)
  - Variance analysis vs baseline
  - Variable change log
  - Account drill-down details (optional)
→ User downloads PDF
```

### 5.2 Sensitivity Analysis Workflow

**Create Multiple Scenarios**:
1. **Conservative Case**: Revenue -10%, Expenses +5%
2. **Base Case**: Current assumptions
3. **Optimistic Case**: Revenue +10%, Expenses -5%

**Compare All Three**:
- System generates variance matrix
- Tornado chart shows which variables impact Net Profit most
- Result: Revenue variance has 2x more impact than expense variance

---

## 6. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-2)
- [ ] Design MongoDB schema (collections + indexes)
- [ ] Create baseline scenario & import service
- [ ] Build core calculation engine
- [ ] API endpoints for scenario CRUD

### Phase 2: Frontend Basics (Weeks 3-4)
- [ ] Scenario list & dashboard
- [ ] Basic variable editor (static form)
- [ ] Statement viewer (read-only)
- [ ] Export to PDF/Excel

### Phase 3: Real-Time Interactivity (Weeks 5-6)
- [ ] Real-time calculation on variable change
- [ ] Dynamic charts (recharts/Chart.js)
- [ ] Comparison mode
- [ ] Drill-down capability

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Sensitivity analysis automation
- [ ] Scenario versioning & branching
- [ ] Multi-scenario comparison
- [ ] Historical simulation mode
- [ ] AI/ML recommendations (future)

---

## 7. DATABASE INDEXES

```javascript
// Optimize for common queries

db.scenarios.createIndex({ company_id: 1, fiscal_year: 1 })
db.scenarios.createIndex({ company_id: 1, status: 1 })
db.scenarios.createIndex({ company_id: 1, is_baseline: 1 })
db.scenarios.createIndex({ created_at: -1 })

db.ledger_masters.createIndex({ company_id: 1, fiscal_year: 1 })
db.comparison_scenarios.createIndex({ company_id: 1, created_at: -1 })

// For aggregations on statement components
db.scenarios.createIndex({ 
  "calculated_statements.profit_loss.total_revenue": 1 
})
```

---

## 8. INTEGRATION WITH EXISTING CODEBASE

### 8.1 Entry Point

Add new module to `frontend/pages/index.js`:
```javascript
const modules = [
  {
    id: "scenario-analysis",
    title: "Scenario Analysis",
    description: "What-if financial modeling and analysis",
    icon: "chart-line"
  },
  // ... existing modules
];
```

### 8.2 Backend Integration

Create new route file:
- `backend/routes/scenarios.js` - All scenario endpoints
- `backend/python/scenario_calculator.py` - Calculation engine

Connect to existing:
- `backend/server.js` - Register new routes
- `backend/.env` - Add any new config

### 8.3 Database

Use existing MongoDB connection.
Create new collections as outlined in section 2.1.

---

## 9. TECHNICAL CONSIDERATIONS

### 9.1 Performance Optimization

| Concern | Solution |
|---------|----------|
| Large recalculations | Cache computed statements; invalidate on variable change |
| Slow drill-downs | Index ledger by account_id; paginate large result sets |
| Multiple scenario loads | Use MongoDB aggregation pipeline for comparisons |
| Real-time UI updates | Use React state + optimistic updates |

### 9.2 Data Integrity

- **Immutability**: Archive old scenario versions; never overwrite
- **Audit Trail**: Track who modified what and when (`created_by`, `last_modified_by`, timestamps)
- **Validation**: Schema validation at DB level; business rules in application
- **Reconciliation**: Balance sheet must always balance (auto-check on save)

### 9.3 Scalability

- **Horizontal**: Stateless backend; MongoDB sharding by company_id
- **Vertical**: Computation optimization; query indexing
- **Async**: Use job queue for large scenario imports (Bulljs, RabbitMQ)

---

## 10. FUTURE ENHANCEMENTS

### AI/ML Features
- **Predictive Adjustments**: "Based on past trends, recommend revenue reduction of 8%"
- **Anomaly Detection**: "Depreciation rate change is unusual for this company"
- **Optimization**: "To maximize profit while meeting debt covenants, reduce expenses by 5-7%"

### Advanced Analytics
- **Sensitivity Dashboard**: Automated sensitivity analysis
- **Monte Carlo Simulation**: Run 10,000 scenarios with variable distributions
- **Stress Testing**: Extreme case analysis (recession, market crash)

### Integration
- **Tally/QuickBooks**: Real-time sync of ledger data
- **BI Tools**: Export calculated statements to Tableau, Power BI
- **CFO Dashboard**: Embed scenario results in executive dashboards

---

## 11. QUICK START: FIRST MODULE

Focus on the **Scenario List & Dashboard**:

1. **Create** `frontend/pages/modules/scenario-analysis/index.js`
2. **Build** `ScenarioList.js` component with mock data
3. **Add** "New Scenario" form modal
4. **Connect** to backend POST `/api/scenarios` endpoint
5. **Display** list from GET `/api/scenarios/company/:companyId`
6. **Add** basic styling with Tailwind

This validates the full flow before building complex statement calculations.

