/**
 * MongoDB Schema Setup for Scenario Analysis System
 * Run this in MongoDB shell or via Atlas UI to create collections with validation
 */

// 1. COMPANIES COLLECTION
db.createCollection("companies", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "fiscal_year", "fiscal_year_end", "chart_of_accounts", "tax_rules"],
            properties: {
                _id: { bsonType: "objectId" },
                name: { bsonType: "string", description: "Company name" },
                fiscal_year: { bsonType: "int", minimum: 2000, maximum: 2100 },
                fiscal_year_end: { bsonType: "string", pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" },

                chart_of_accounts: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["account_id", "account_name", "account_type"],
                        properties: {
                            account_id: { bsonType: "string" },
                            account_name: { bsonType: "string" },
                            account_type: {
                                enum: ["asset", "liability", "equity", "revenue", "expense", "tax"]
                            },
                            account_group: { bsonType: "string" },
                            is_control_account: { bsonType: "bool" },
                            default_debit_or_credit: { enum: ["debit", "credit"] }
                        }
                    }
                },

                tax_rules: {
                    bsonType: "object",
                    properties: {
                        income_tax_rate: { bsonType: "double", minimum: 0, maximum: 100 },
                        surcharge_rate: { bsonType: "double", minimum: 0, maximum: 100 },
                        cess_rate: { bsonType: "double", minimum: 0, maximum: 100 },
                        depreciation_method: { enum: ["wdv", "sl"] },
                        depreciation_rates: { bsonType: "object" },
                        provisioning_rules: { bsonType: "array" }
                    }
                },

                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
})

// 2. LEDGER_MASTERS COLLECTION
db.createCollection("ledger_masters", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["company_id", "fiscal_year", "account_balances"],
            properties: {
                _id: { bsonType: "objectId" },
                company_id: { bsonType: "objectId" },
                fiscal_year: { bsonType: "int" },

                account_balances: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            account_id: { bsonType: "string" },
                            account_name: { bsonType: "string" },
                            opening_balance: { bsonType: ["int", "double"] },
                            current_balance: { bsonType: ["int", "double"] },
                            is_master_balance: { bsonType: "bool" }
                        }
                    }
                },

                transactions: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            voucher_id: { bsonType: "string" },
                            date: { bsonType: "date" },
                            description: { bsonType: "string" },
                            account_id: { bsonType: "string" },
                            debit: { bsonType: ["int", "double"] },
                            credit: { bsonType: ["int", "double"] },
                            row_index: { bsonType: "int" }
                        }
                    }
                },

                source_file: { bsonType: "string" },
                import_date: { bsonType: "date" },
                import_user: { bsonType: "string" },

                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
})

// 3. SCENARIOS COLLECTION (Main)
db.createCollection("scenarios", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["company_id", "fiscal_year", "scenario_name", "scenario_type"],
            properties: {
                _id: { bsonType: "objectId" },
                company_id: { bsonType: "objectId" },
                fiscal_year: { bsonType: "int" },

                scenario_name: { bsonType: "string" },
                scenario_type: { enum: ["baseline", "forecast", "sensitivity", "historical"] },
                description: { bsonType: "string" },

                baseline_ref: { bsonType: ["objectId", "null"] },
                parent_scenario_id: { bsonType: "objectId" },
                scenario_version: { bsonType: "int", minimum: 1 },

                variables: {
                    bsonType: "object",
                    properties: {
                        revenue_adjustments: { bsonType: "array" },
                        expense_adjustments: { bsonType: "array" },
                        tax_variables: { bsonType: "array" },
                        other_variables: { bsonType: "array" }
                    }
                },

                calculated_statements: {
                    bsonType: "object",
                    properties: {
                        profit_loss: { bsonType: "object" },
                        balance_sheet: { bsonType: "object" },
                        cash_flow: { bsonType: "object" },
                        tax_summary: { bsonType: "object" }
                    }
                },

                is_baseline: { bsonType: "bool" },
                is_locked: { bsonType: "bool" },
                status: { enum: ["draft", "finalized", "archived"] },

                created_by: { bsonType: "string" },
                created_at: { bsonType: "date" },
                last_modified_by: { bsonType: "string" },
                last_modified_at: { bsonType: "date" },

                tags: { bsonType: "array", items: { bsonType: "string" } }
            }
        }
    }
})

// 4. SCENARIO_COMPARISONS COLLECTION
db.createCollection("scenario_comparisons", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["company_id", "fiscal_year", "scenarios"],
            properties: {
                _id: { bsonType: "objectId" },
                company_id: { bsonType: "objectId" },
                fiscal_year: { bsonType: "int" },

                comparison_name: { bsonType: "string" },

                scenarios: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["scenario_id", "position"],
                        properties: {
                            scenario_id: { bsonType: "objectId" },
                            scenario_name: { bsonType: "string" },
                            position: { bsonType: "int" }
                        }
                    }
                },

                variance_analysis: { bsonType: "object" },

                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                created_by: { bsonType: "string" }
            }
        }
    }
})

// 5. CALCULATION_RULES COLLECTION
db.createCollection("calculation_rules", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["company_id"],
            properties: {
                _id: { bsonType: "objectId" },
                company_id: { bsonType: "objectId" },

                pl_statement_mapping: { bsonType: "array" },
                bs_statement_mapping: { bsonType: "array" },
                tax_calculation_rules: { bsonType: "array" },
                depreciation_rules: { bsonType: "array" }
            }
        }
    }
})

// CREATE INDEXES
db.companies.createIndex({ name: 1 }, { unique: false })

db.ledger_masters.createIndex({ company_id: 1, fiscal_year: 1 })
db.ledger_masters.createIndex({ "account_balances.account_id": 1 })

db.scenarios.createIndex({ company_id: 1, fiscal_year: 1 })
db.scenarios.createIndex({ company_id: 1, status: 1 })
db.scenarios.createIndex({ company_id: 1, is_baseline: 1 })
db.scenarios.createIndex({ company_id: 1, created_at: -1 })
db.scenarios.createIndex({ parent_scenario_id: 1 })

db.scenario_comparisons.createIndex({ company_id: 1, created_at: -1 })
db.scenario_comparisons.createIndex({ "scenarios.scenario_id": 1 })

db.calculation_rules.createIndex({ company_id: 1 }, { unique: true })

print("✅ Collections created successfully with validation rules and indexes!")
