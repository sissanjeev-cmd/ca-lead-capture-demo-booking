import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const variableAdjustmentSchema = new Schema(
    {
        account_id: { type: String, required: false },
        account_name: { type: String, required: false },
        change_amount: { type: Number, default: 0 },
        change_percentage: { type: Number, default: 0 },
        type: { type: String, required: false },
        description: { type: String, required: false }
    },
    { _id: false }
);

const scenarioSchema = new Schema(
    {
        company_id: { type: Schema.Types.ObjectId, required: true, index: true },
        fiscal_year: { type: Number, required: true, default: new Date().getFullYear() },
        scenario_name: { type: String, required: true },
        scenario_type: {
            type: String,
            enum: ['baseline', 'forecast', 'sensitivity', 'historical'],
            default: 'forecast'
        },
        description: { type: String, default: '' },
        baseline_ref: { type: Schema.Types.ObjectId, default: null },
        parent_scenario_id: { type: Schema.Types.ObjectId, default: null },
        scenario_version: { type: Number, default: 1 },
        variables: {
            revenue_adjustments: { type: [variableAdjustmentSchema], default: [] },
            expense_adjustments: { type: [variableAdjustmentSchema], default: [] },
            tax_variables: { type: [variableAdjustmentSchema], default: [] },
            other_variables: { type: [variableAdjustmentSchema], default: [] }
        },
        calculated_statements: {
            profit_loss: { type: Schema.Types.Mixed, default: {} },
            balance_sheet: { type: Schema.Types.Mixed, default: {} },
            cash_flow: { type: Schema.Types.Mixed, default: {} },
            tax_summary: { type: Schema.Types.Mixed, default: {} }
        },
        is_baseline: { type: Boolean, default: false, index: true },
        is_locked: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ['draft', 'finalized', 'archived'],
            default: 'draft'
        },
        created_by: { type: String, default: 'system' },
        last_modified_by: { type: String, default: 'system' },
        tags: { type: [String], default: [] }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'last_modified_at' }
    }
);

scenarioSchema.index({ status: 1 });
scenarioSchema.index({ parent_scenario_id: 1 });

const Scenario = model('Scenario', scenarioSchema);

export default Scenario;
