# Copilot Instructions - Financial Scenario Analysis System

## Project Overview
A full-stack financial scenario analysis platform for Chartered Accountants to simulate what-if scenarios, track impacts on financial statements, and compare multiple scenarios.

**Stack**: Next.js (Frontend) + Express.js (Backend) + MongoDB (Database) + Python (Calculations)

## Development Workflow

### Setup
1. **Frontend**: `cd frontend && npm install && npm run dev`
2. **Backend**: `cd backend && npm install && npm run dev`
3. **Database**: Import `mongodb-schema-setup.js` in MongoDB Atlas
4. **Python**: `pip install -r backend/python/requirements.txt`

### Directory Structure
```
financial-scenario-analysis/
├── frontend/                    # Next.js React application
│   ├── src/app/                 # App Router pages
│   ├── src/components/          # Reusable React components
│   └── src/styles/              # Global styles
├── backend/                     # Express.js server
│   ├── server.js                # Main server entry
│   ├── routes/                  # API route handlers
│   │   ├── scenarios.js         # Scenario CRUD
│   │   └── calculations.js      # Statement calculations
│   ├── python/                  # Python calculation engine
│   │   ├── calculator.py        # Financial calculations
│   │   └── requirements.txt     # Python dependencies
│   └── outputs/                 # Generated reports/exports
├── SCENARIO_ANALYSIS_DESIGN.md  # Complete system design document
├── mongodb-schema-setup.js      # MongoDB collection schemas
└── README.md                    # Project documentation
```

## Key Features to Implement

### Phase 1: Foundation (Weeks 1-2)
- [ ] Connect backend to MongoDB
- [ ] Implement scenario CRUD endpoints
- [ ] Create basic scenario list UI
- [ ] Setup baseline scenario creation from import

### Phase 2: Core Calculations (Weeks 3-4)
- [ ] Integrate Python calculator with Node.js
- [ ] Implement P&L, Balance Sheet, Cash Flow calculations
- [ ] Tax calculation engine
- [ ] Real-time recalculation on variable changes

### Phase 3: Frontend UI (Weeks 5-6)
- [ ] Dashboard with scenario explorer
- [ ] Variable adjustment panel with sliders
- [ ] Financial statement viewer component
- [ ] Comparison matrix display

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Scenario versioning & branching
- [ ] Multi-scenario comparison
- [ ] Drill-down to ledger details
- [ ] PDF/Excel export capability

## Environment Variables

Backend `.env` should include:
```
MONGODB_URI=<your-connection-string>
MONGODB_DB_NAME=financial-scenario-analysis
PORT=4000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Frontend `.env.local` should include:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Common Commands

**Frontend**:
- `npm run dev` - Start dev server on localhost:3000
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

**Backend**:
- `npm run dev` - Start dev server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

**Python**:
- `pip install -r python/requirements.txt` - Install dependencies
- `python3 python/calculator.py < input.json` - Test calculator with JSON input

## API Endpoints

### Scenarios
- `GET /api/scenarios?companyId=X` - List scenarios
- `GET /api/scenarios/:scenarioId` - Get scenario details
- `POST /api/scenarios` - Create new scenario
- `PUT /api/scenarios/:scenarioId` - Update scenario variables
- `DELETE /api/scenarios/:scenarioId` - Archive scenario

### Calculations
- `POST /api/calculate/statements` - Recalculate statements
- `POST /api/calculate/tax` - Calculate tax liability
- `GET /api/impact-analysis/:scenarioId` - Get variable impacts

## Database Schema

All MongoDB collections are defined in `mongodb-schema-setup.js`:
- **companies** - Company master data with chart of accounts
- **ledger_masters** - Historical ledger balances
- **scenarios** - Scenario definitions with calculated statements
- **scenario_comparisons** - Saved scenario comparisons
- **calculation_rules** - P&L/BS mapping and tax rules

## Design Reference

Complete system architecture and design patterns are documented in `SCENARIO_ANALYSIS_DESIGN.md`, including:
- System architecture diagram
- Data model with schema examples
- UI/UX component descriptions
- Workflow examples
- Implementation roadmap

## Performance Considerations

- Cache calculated statements using MongoDB
- Index scenarios by company_id and creation date
- Use aggregation pipelines for complex comparisons
- Implement lazy loading for large ledger drill-downs

## Git Workflow

- Never commit `.env` (use `.env.example` as template)
- Keep frontend and backend in separate package versions
- Tag releases with semantic versioning (v1.0.0, etc.)

## Debugging Tips

1. **Backend won't connect to MongoDB**: Check `MONGODB_URI` and network access on Atlas
2. **Python calculator fails**: Test directly with `echo '{"type":"pl_statement",...}' | python3 python/calculator.py`
3. **Frontend can't reach API**: Verify `NEXT_PUBLIC_API_URL` and CORS settings on backend
4. **Real-time calculations slow**: Profile queries and add indexes as needed
