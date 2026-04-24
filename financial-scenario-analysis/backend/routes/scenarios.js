import express from 'express';
import mongoose from 'mongoose';
import Scenario from '../models/Scenario.js';

const router = express.Router();

/**
 * GET /api/scenarios
 * Fetch all scenarios for a company
 */
router.get('/', async (req, res) => {
    try {
        const { companyId, limit = 20, skip = 0 } = req.query;

        if (!companyId) {
            return res.status(400).json({ error: 'companyId is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(String(companyId))) {
            return res.status(400).json({ error: 'companyId must be a valid ObjectId' });
        }

        const companyObjectId = new mongoose.Types.ObjectId(companyId);
        const query = { company_id: companyObjectId, status: { $ne: 'archived' } };
        const total = await Scenario.countDocuments(query);
        const data = await Scenario.find(query)
            .sort({ created_at: -1 })
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();

        res.json({
            message: 'Scenarios list',
            data,
            total,
            limit: Number(limit),
            skip: Number(skip)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/scenarios/:scenarioId
 * Fetch single scenario details
 */
router.get('/:scenarioId', async (req, res) => {
    try {
        const { scenarioId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(scenarioId)) {
            return res.status(400).json({ error: 'scenarioId must be a valid ObjectId' });
        }

        const scenario = await Scenario.findById(scenarioId).lean();

        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found' });
        }

        res.json({
            message: 'Scenario details',
            scenarioId,
            data: scenario
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/scenarios
 * Create new scenario
 */
router.post('/', async (req, res) => {
    try {
        const {
            companyId,
            scenarioName,
            baselineRef = null,
            description = '',
            fiscalYear = new Date().getFullYear(),
            scenarioType = 'forecast',
            variables = {},
            createdBy = 'system'
        } = req.body;

        if (!companyId || !scenarioName) {
            return res.status(400).json({ error: 'companyId and scenarioName are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ error: 'companyId must be a valid ObjectId' });
        }

        const payload = {
            company_id: new mongoose.Types.ObjectId(companyId),
            fiscal_year: fiscalYear,
            scenario_name: scenarioName,
            scenario_type: scenarioType,
            description,
            baseline_ref: baselineRef && mongoose.Types.ObjectId.isValid(baselineRef) ? new mongoose.Types.ObjectId(baselineRef) : null,
            variables,
            created_by: createdBy,
            last_modified_by: createdBy
        };

        const newScenario = await Scenario.create(payload);

        res.status(201).json({
            message: 'Scenario created',
            data: newScenario
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/scenarios/:scenarioId
 * Update scenario variables
 */
router.put('/:scenarioId', async (req, res) => {
    try {
        const { scenarioId } = req.params;
        const { variables, lastModifiedBy = 'system' } = req.body;

        if (!mongoose.Types.ObjectId.isValid(scenarioId)) {
            return res.status(400).json({ error: 'scenarioId must be a valid ObjectId' });
        }

        if (!variables || typeof variables !== 'object') {
            return res.status(400).json({ error: 'variables object is required' });
        }

        const scenario = await Scenario.findById(scenarioId);

        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found' });
        }

        if (scenario.is_locked) {
            return res.status(403).json({ error: 'Scenario is locked and cannot be updated' });
        }

        scenario.variables = variables;
        scenario.last_modified_by = lastModifiedBy;
        scenario.scenario_version += 1;
        await scenario.save();

        res.json({
            message: 'Scenario updated',
            scenarioId,
            data: scenario
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/scenarios/:scenarioId
 * Archive/delete scenario
 */
router.delete('/:scenarioId', async (req, res) => {
    try {
        const { scenarioId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(scenarioId)) {
            return res.status(400).json({ error: 'scenarioId must be a valid ObjectId' });
        }

        const scenario = await Scenario.findById(scenarioId);

        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found' });
        }

        scenario.status = 'archived';
        scenario.last_modified_by = 'system';
        await scenario.save();

        res.json({
            message: 'Scenario archived',
            scenarioId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
