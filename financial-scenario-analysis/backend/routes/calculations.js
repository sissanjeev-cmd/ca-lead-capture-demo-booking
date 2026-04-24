import { spawn } from 'child_process';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Scenario from '../models/Scenario.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const calculatorPath = path.join(__dirname, '..', 'python', 'calculator.py');

const runPythonCalculation = (payload) => {
    return new Promise((resolve, reject) => {
        const pythonPath = process.env.PYTHON_PATH || 'python3';
        const python = spawn(pythonPath, [calculatorPath], { stdio: ['pipe', 'pipe', 'pipe'] });

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        python.on('error', (error) => reject(error));
        python.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(stderr || `Python exited with code ${code}`));
            }
            try {
                resolve(JSON.parse(stdout));
            } catch (error) {
                reject(error);
            }
        });

        python.stdin.write(JSON.stringify(payload));
        python.stdin.end();
    });
};

const buildDefaultLedger = () => ({
    revenue: 1000000,
    cogs: 420000,
    opex: 240000,
    finance_cost: 18000
});

/**
 * POST /api/calculate/statements
 * Recalculate P&L, Balance Sheet, Cash Flow, Tax based on scenario variables
 */
router.post('/statements', async (req, res) => {
    try {
        const { scenarioId, variables } = req.body;

        if (!scenarioId) {
            return res.status(400).json({ error: 'scenarioId is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(scenarioId)) {
            return res.status(400).json({ error: 'scenarioId must be a valid ObjectId' });
        }

        const scenario = await Scenario.findById(scenarioId);
        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found' });
        }

        const finalVariables = variables && typeof variables === 'object' ? variables : scenario.variables || {};
        const ledgerData = buildDefaultLedger();

        const profitLoss = await runPythonCalculation({
            type: 'pl_statement',
            payload: {
                ledger_data: ledgerData,
                variables: finalVariables
            }
        });

        const taxSummary = await runPythonCalculation({
            type: 'tax',
            payload: {
                taxable_income: profitLoss.ebt || 0,
                tax_rates: {
                    income_tax_rate: 25,
                    surcharge_rate: 12,
                    cess_rate: 4
                }
            }
        });

        const balanceSheet = await runPythonCalculation({
            type: 'balance_sheet',
            payload: {
                assets: {
                    cash: 220000,
                    receivables: 180000,
                    inventory: 76000
                },
                liabilities: {
                    payables: 130000,
                    debt: 170000
                },
                equity: {
                    retained_earnings: 196000
                }
            }
        });

        const cashFlow = await runPythonCalculation({
            type: 'cash_flow',
            payload: {
                operating: (profitLoss.ebit || 0) - (taxSummary.total_tax || 0),
                investing: -50000,
                financing: 30000
            }
        });

        scenario.calculated_statements = {
            profit_loss: profitLoss,
            balance_sheet: balanceSheet,
            cash_flow: cashFlow,
            tax_summary: taxSummary
        };
        await scenario.save();

        res.json({
            message: 'Calculations complete',
            scenarioId,
            calculatedStatements: scenario.calculated_statements,
            calculationTimeMs: 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/calculate/tax
 * Calculate tax impact based on income and adjustments
 */
router.post('/tax', async (req, res) => {
    try {
        const { taxableIncome, taxRates } = req.body;

        if (typeof taxableIncome !== 'number' || !taxRates || typeof taxRates !== 'object') {
            return res.status(400).json({ error: 'taxableIncome and taxRates are required' });
        }

        const taxResult = await runPythonCalculation({
            type: 'tax',
            payload: {
                taxable_income: taxableIncome,
                tax_rates: taxRates
            }
        });

        res.json({
            message: 'Tax calculation complete',
            data: taxResult
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/impact-analysis/:scenarioId
 * Get variable-level impact breakdown
 */
router.get('/impact-analysis/:scenarioId', async (req, res) => {
    try {
        const { scenarioId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(scenarioId)) {
            return res.status(400).json({ error: 'scenarioId must be a valid ObjectId' });
        }

        const scenario = await Scenario.findById(scenarioId).lean();
        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found' });
        }

        const baseline = scenario.baseline_ref && mongoose.Types.ObjectId.isValid(scenario.baseline_ref)
            ? await Scenario.findById(scenario.baseline_ref).lean()
            : null;

        const currentProfit = scenario?.calculated_statements?.profit_loss?.net_profit || 0;
        const baselineProfit = baseline?.calculated_statements?.profit_loss?.net_profit || 0;
        const currentTax = scenario?.calculated_statements?.tax_summary?.total_tax || 0;
        const baselineTax = baseline?.calculated_statements?.tax_summary?.total_tax || 0;

        res.json({
            message: 'Impact analysis',
            scenarioId,
            baselineId: scenario.baseline_ref || null,
            impacts: {
                revenue_impact: 0,
                expense_impact: 0,
                tax_impact: currentTax - baselineTax,
                net_profit_impact: currentProfit - baselineProfit
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
