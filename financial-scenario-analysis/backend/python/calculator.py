#!/usr/bin/env python3
"""
Financial Statement Calculator
Handles P&L, Balance Sheet, Cash Flow, and Tax calculations
"""

import json
import sys

def calculate_pl_statement(ledger_data, variables):
    """
    Calculate Profit & Loss statement from ledger data and variable adjustments
    
    Args:
        ledger_data: Dict with account balances
        variables: Dict with revenue/expense adjustments
    
    Returns:
        Dict with P&L line items and totals
    """
    try:
        # Revenue section
        total_revenue = ledger_data.get('revenue', 0)
        if 'revenue_adjustments' in variables:
            for adj in variables['revenue_adjustments']:
                total_revenue += adj.get('change_amount', 0)
        
        # COGS section
        total_cogs = ledger_data.get('cogs', 0)
        if 'cogs_adjustments' in variables:
            for adj in variables['cogs_adjustments']:
                total_cogs += adj.get('change_amount', 0)
        
        gross_profit = total_revenue - total_cogs
        
        # Operating Expenses
        total_opex = ledger_data.get('opex', 0)
        if 'expense_adjustments' in variables:
            for adj in variables['expense_adjustments']:
                if adj.get('type') == 'operating':
                    total_opex += adj.get('change_amount', 0)
        
        ebit = gross_profit - total_opex
        
        # Finance costs
        finance_cost = ledger_data.get('finance_cost', 0)
        ebt = ebit - finance_cost
        
        # Tax (calculated separately)
        income_tax = 0
        net_profit = ebt - income_tax
        
        return {
            'total_revenue': total_revenue,
            'total_cogs': total_cogs,
            'gross_profit': gross_profit,
            'total_opex': total_opex,
            'ebit': ebit,
            'finance_cost': finance_cost,
            'ebt': ebt,
            'income_tax': income_tax,
            'net_profit': net_profit
        }
    except Exception as e:
        return {'error': str(e)}

def calculate_balance_sheet(assets, liabilities, equity):
    """
    Calculate Balance Sheet with validation
    
    Args:
        assets: Dict with asset categories
        liabilities: Dict with liability categories
        equity: Dict with equity components
    
    Returns:
        Dict with balanced balance sheet
    """
    try:
        total_assets = sum(assets.values()) if isinstance(assets, dict) else 0
        total_liabilities = sum(liabilities.values()) if isinstance(liabilities, dict) else 0
        total_equity = sum(equity.values()) if isinstance(equity, dict) else 0
        
        # Validate balance: Assets = Liabilities + Equity
        total_le = total_liabilities + total_equity
        
        if total_assets != total_le:
            # Log warning but continue
            error_msg = f"Balance sheet imbalance: Assets {total_assets} != L+E {total_le}"
        
        return {
            'total_assets': total_assets,
            'total_liabilities': total_liabilities,
            'total_equity': total_equity,
            'balanced': total_assets == total_le
        }
    except Exception as e:
        return {'error': str(e)}

def calculate_cash_flow(operating, investing, financing):
    """
    Calculate Cash Flow statement
    
    Args:
        operating: Operating activities cash flow
        investing: Investing activities cash flow
        financing: Financing activities cash flow
    
    Returns:
        Dict with cash flow components and net change
    """
    try:
        net_cash_flow = operating + investing + financing
        
        return {
            'operating_activities': operating,
            'investing_activities': investing,
            'financing_activities': financing,
            'net_cash_flow': net_cash_flow
        }
    except Exception as e:
        return {'error': str(e)}

def calculate_tax(taxable_income, tax_rates):
    """
    Calculate tax liability based on taxable income and rates
    
    Args:
        taxable_income: Net taxable income
        tax_rates: Dict with income_tax_rate, surcharge_rate, cess_rate
    
    Returns:
        Dict with income tax, surcharge, cess, and total
    """
    try:
        income_tax_rate = tax_rates.get('income_tax_rate', 30) / 100
        surcharge_rate = tax_rates.get('surcharge_rate', 12) / 100
        cess_rate = tax_rates.get('cess_rate', 4) / 100
        
        income_tax = taxable_income * income_tax_rate
        surcharge = income_tax * surcharge_rate
        cess = (income_tax + surcharge) * cess_rate
        total_tax = income_tax + surcharge + cess
        
        effective_rate = (total_tax / taxable_income * 100) if taxable_income > 0 else 0
        
        return {
            'taxable_income': taxable_income,
            'income_tax': income_tax,
            'surcharge': surcharge,
            'cess': cess,
            'total_tax': total_tax,
            'effective_tax_rate': effective_rate
        }
    except Exception as e:
        return {'error': str(e)}

def main():
    """Main entry point - accepts JSON input and returns JSON output"""
    try:
        # Read JSON from stdin
        input_data = json.loads(sys.stdin.read())
        
        calculation_type = input_data.get('type')
        payload = input_data.get('payload', {})
        
        result = {}
        
        if calculation_type == 'pl_statement':
            result = calculate_pl_statement(
                payload.get('ledger_data', {}),
                payload.get('variables', {})
            )
        elif calculation_type == 'balance_sheet':
            result = calculate_balance_sheet(
                payload.get('assets', {}),
                payload.get('liabilities', {}),
                payload.get('equity', {})
            )
        elif calculation_type == 'cash_flow':
            result = calculate_cash_flow(
                payload.get('operating', 0),
                payload.get('investing', 0),
                payload.get('financing', 0)
            )
        elif calculation_type == 'tax':
            result = calculate_tax(
                payload.get('taxable_income', 0),
                payload.get('tax_rates', {})
            )
        else:
            result = {'error': f'Unknown calculation type: {calculation_type}'}
        
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError as e:
        print(json.dumps({'error': f'JSON parse error: {str(e)}'}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
