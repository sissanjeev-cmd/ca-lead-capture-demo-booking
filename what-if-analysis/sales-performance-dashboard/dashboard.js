/* ============================================================
   SALES DASHBOARD 2025 — Main JavaScript
   Depends on: salesData.js (RAW_DATA), Chart.js
   ============================================================ */

/* ── Global Chart Registry ── */
const CHARTS = {};

/* ── Palette ── */
const PAL = {
  blue:   '#4cc9f0',
  purple: '#7b5ea7',
  pink:   '#e94560',
  green:  '#2ecc71',
  orange: '#f39c12',
  teal:   '#00b4d8',
  yellow: '#f1fa8c',
  bgCard: '#1a2744',
  text:   '#e0e6ed',
  muted:  '#718096',
  grid:   'rgba(76,201,240,0.08)',
};

const CATEGORY_COLORS = { Electronics: PAL.blue, Clothing: PAL.green, Furniture: PAL.orange };
const REP_COLORS      = { Ajay: PAL.blue, Pooja: PAL.pink, Rahul: PAL.orange, Sneha: PAL.green };
const CITY_COLORS     = [PAL.blue, PAL.purple, PAL.pink, PAL.green, PAL.orange];
const PAYMENT_COLORS  = [PAL.blue, PAL.green, PAL.orange, PAL.pink];

/* ── Chart.js Global Defaults ── */
Chart.defaults.color          = PAL.muted;
Chart.defaults.font.family    = "'Segoe UI', Arial, sans-serif";
Chart.defaults.font.size      = 12;
Chart.defaults.plugins.legend.labels.boxWidth = 12;
Chart.defaults.plugins.legend.labels.padding  = 14;

/* ════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════ */
function fmt(n) {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(1) + 'Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1) + 'L';
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function fmtFull(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function sum(arr, key) { return arr.reduce((s, r) => s + r[key], 0); }

function groupBy(arr, key, valKey) {
  const m = {};
  arr.forEach(r => {
    m[r[key]] = (m[r[key]] || 0) + r[valKey];
  });
  return m;
}

function getMonthLabel(ym) {
  const [y, m] = ym.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[parseInt(m) - 1] + ' ' + y.slice(2);
}

/* ════════════════════════════════════════════════════
   FILTER ENGINE
════════════════════════════════════════════════════ */
let filteredData = [...RAW_DATA];

function applyFilters() {
  const dateStart = document.getElementById('f-date-start').value;
  const dateEnd   = document.getElementById('f-date-end').value;
  const city      = document.getElementById('f-city').value;
  const category  = document.getElementById('f-category').value;
  const rep       = document.getElementById('f-rep').value;

  filteredData = RAW_DATA.filter(r => {
    if (dateStart && r.date < dateStart) return false;
    if (dateEnd   && r.date > dateEnd)   return false;
    if (city      && r.city !== city)    return false;
    if (category  && r.category !== category) return false;
    if (rep       && r.rep !== rep)      return false;
    return true;
  });

  renderAll();
}

function resetFilters() {
  document.getElementById('f-date-start').value = '2025-01-01';
  document.getElementById('f-date-end').value   = '2025-12-31';
  document.getElementById('f-city').value       = '';
  document.getElementById('f-category').value   = '';
  document.getElementById('f-rep').value        = '';
  filteredData = [...RAW_DATA];
  renderAll();
}

/* ════════════════════════════════════════════════════
   KPI CARDS
════════════════════════════════════════════════════ */
function renderKPIs(data) {
  const totalSales  = sum(data, 'sales');
  const totalProfit = sum(data, 'profit');
  const totalOrders = data.length;
  const aov         = totalOrders > 0 ? totalSales / totalOrders : 0;
  const margin      = totalSales > 0 ? (totalProfit / totalSales * 100) : 0;

  document.getElementById('kpi-sales').textContent     = fmt(totalSales);
  document.getElementById('kpi-sales-sub').textContent = `${totalOrders.toLocaleString()} orders · ${fmtFull(totalSales)}`;

  document.getElementById('kpi-profit').textContent     = fmt(totalProfit);
  document.getElementById('kpi-profit-sub').textContent = `Margin: ${margin.toFixed(1)}%`;

  document.getElementById('kpi-orders').textContent     = totalOrders.toLocaleString();
  document.getElementById('kpi-orders-sub').textContent = `Avg ${(sum(data,'units')/Math.max(totalOrders,1)).toFixed(1)} units/order`;

  document.getElementById('kpi-aov').textContent     = fmt(aov);
  document.getElementById('kpi-aov-sub').textContent = `Per order average`;

  document.getElementById('record-count').textContent = `${totalOrders.toLocaleString()} Records`;
}

/* ════════════════════════════════════════════════════
   CHART FACTORY
════════════════════════════════════════════════════ */
function destroyChart(id) {
  if (CHARTS[id]) { CHARTS[id].destroy(); delete CHARTS[id]; }
}

function axisDefaults() {
  return {
    grid: { color: PAL.grid },
    ticks: { color: PAL.muted },
    border: { color: PAL.grid }
  };
}

/* ── Monthly Sales Trend (Line) ── */
function renderMonthly(data) {
  destroyChart('monthly');
  const monthMap = {};
  data.forEach(r => {
    const ym = r.date.slice(0, 7);
    if (!monthMap[ym]) monthMap[ym] = { sales: 0, profit: 0 };
    monthMap[ym].sales  += r.sales;
    monthMap[ym].profit += r.profit;
  });

  const months = Object.keys(monthMap).sort();
  const salesVals  = months.map(m => monthMap[m].sales);
  const profitVals = months.map(m => monthMap[m].profit);

  const ctx = document.getElementById('chart-monthly').getContext('2d');

  const gradSales = ctx.createLinearGradient(0, 0, 0, 260);
  gradSales.addColorStop(0, 'rgba(76,201,240,0.35)');
  gradSales.addColorStop(1, 'rgba(76,201,240,0)');

  const gradProfit = ctx.createLinearGradient(0, 0, 0, 260);
  gradProfit.addColorStop(0, 'rgba(46,204,113,0.25)');
  gradProfit.addColorStop(1, 'rgba(46,204,113,0)');

  CHARTS['monthly'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(getMonthLabel),
      datasets: [
        {
          label: 'Sales',
          data: salesVals,
          borderColor: PAL.blue,
          backgroundColor: gradSales,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: PAL.blue,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Profit',
          data: profitVals,
          borderColor: PAL.green,
          backgroundColor: gradProfit,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: PAL.green,
          tension: 0.4,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmtFull(ctx.raw)}`
          }
        }
      },
      scales: {
        x: axisDefaults(),
        y: { ...axisDefaults(), ticks: { color: PAL.muted, callback: v => fmt(v) } }
      }
    }
  });
}

/* ── City-wise Sales (Horizontal Bar) ── */
function renderCity(data) {
  destroyChart('city');
  const m = groupBy(data, 'city', 'sales');
  const cities  = Object.keys(m).sort((a, b) => m[b] - m[a]);
  const vals    = cities.map(c => m[c]);
  const maxVal  = Math.max(...vals);

  CHARTS['city'] = new Chart(document.getElementById('chart-city'), {
    type: 'bar',
    data: {
      labels: cities,
      datasets: [{
        label: 'Total Sales',
        data: vals,
        backgroundColor: cities.map((_, i) => CITY_COLORS[i % CITY_COLORS.length] + 'cc'),
        borderColor:     cities.map((_, i) => CITY_COLORS[i % CITY_COLORS.length]),
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${fmtFull(ctx.raw)}` } }
      },
      scales: {
        x: { ...axisDefaults(), ticks: { color: PAL.muted, callback: v => fmt(v) }, max: maxVal * 1.1 },
        y: axisDefaults()
      }
    }
  });
}

/* ── Category Performance (Doughnut) ── */
function renderCategory(data) {
  destroyChart('category');
  const m = groupBy(data, 'category', 'sales');
  const cats = Object.keys(m);
  const vals = cats.map(c => m[c]);
  const total = vals.reduce((a, b) => a + b, 0);

  CHARTS['category'] = new Chart(document.getElementById('chart-category'), {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{
        data: vals,
        backgroundColor: cats.map(c => (CATEGORY_COLORS[c] || PAL.teal) + 'cc'),
        borderColor:     cats.map(c => CATEGORY_COLORS[c] || PAL.teal),
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${fmtFull(ctx.raw)} (${(ctx.raw/total*100).toFixed(1)}%)`
          }
        }
      }
    }
  });
}

/* ── Sales Rep Performance (Bar) ── */
function renderRep(data) {
  destroyChart('rep');
  const salesM  = groupBy(data, 'rep', 'sales');
  const profitM = groupBy(data, 'rep', 'profit');
  const reps = Object.keys(salesM).sort((a, b) => salesM[b] - salesM[a]);

  CHARTS['rep'] = new Chart(document.getElementById('chart-rep'), {
    type: 'bar',
    data: {
      labels: reps,
      datasets: [
        {
          label: 'Sales',
          data: reps.map(r => salesM[r] || 0),
          backgroundColor: reps.map(r => (REP_COLORS[r] || PAL.teal) + 'bb'),
          borderColor:     reps.map(r => REP_COLORS[r] || PAL.teal),
          borderWidth: 1.5,
          borderRadius: 6,
        },
        {
          label: 'Profit',
          data: reps.map(r => profitM[r] || 0),
          backgroundColor: 'rgba(46,204,113,0.3)',
          borderColor: PAL.green,
          borderWidth: 1.5,
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmtFull(ctx.raw)}` } }
      },
      scales: {
        x: axisDefaults(),
        y: { ...axisDefaults(), ticks: { color: PAL.muted, callback: v => fmt(v) } }
      }
    }
  });
}

/* ── Payment Method (Pie) ── */
function renderPayment(data) {
  destroyChart('payment');
  const m = groupBy(data, 'payment', 'sales');
  const methods = Object.keys(m);
  const vals    = methods.map(p => m[p]);
  const total   = vals.reduce((a, b) => a + b, 0);

  CHARTS['payment'] = new Chart(document.getElementById('chart-payment'), {
    type: 'pie',
    data: {
      labels: methods,
      datasets: [{
        data: vals,
        backgroundColor: PAYMENT_COLORS.map(c => c + 'bb'),
        borderColor:     PAYMENT_COLORS,
        borderWidth: 2,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${(ctx.raw/total*100).toFixed(1)}% (${fmtFull(ctx.raw)})`
          }
        }
      }
    }
  });
}

/* ── Profitability: Profit vs Sales by Category (Grouped Bar) ── */
function renderProfitability(data) {
  destroyChart('profitability');
  const cats = [...new Set(data.map(r => r.category))].sort();
  const salesByCat  = cats.map(c => sum(data.filter(r => r.category === c), 'sales'));
  const profitByCat = cats.map(c => sum(data.filter(r => r.category === c), 'profit'));

  CHARTS['profitability'] = new Chart(document.getElementById('chart-profitability'), {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [
        {
          label: 'Total Sales',
          data: salesByCat,
          backgroundColor: cats.map(c => (CATEGORY_COLORS[c] || PAL.teal) + 'bb'),
          borderColor:     cats.map(c => CATEGORY_COLORS[c] || PAL.teal),
          borderWidth: 1.5,
          borderRadius: 6,
        },
        {
          label: 'Total Profit',
          data: profitByCat,
          backgroundColor: 'rgba(123,94,167,0.5)',
          borderColor: PAL.purple,
          borderWidth: 1.5,
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmtFull(ctx.raw)}`,
            afterBody: items => {
              const cat = cats[items[0].dataIndex];
              const s = salesByCat[items[0].dataIndex];
              const p = profitByCat[items[0].dataIndex];
              return [`Margin: ${s > 0 ? (p/s*100).toFixed(1) : 0}%`];
            }
          }
        }
      },
      scales: {
        x: axisDefaults(),
        y: { ...axisDefaults(), ticks: { color: PAL.muted, callback: v => fmt(v) } }
      }
    }
  });
}

/* ── Discount Impact on Profit (Bar) ── */
function renderDiscount(data) {
  destroyChart('discount');
  const discounts = [0, 5, 10, 15];
  const avgProfit = discounts.map(d => {
    const rows = data.filter(r => r.discount === d);
    return rows.length > 0 ? sum(rows, 'profit') / rows.length : 0;
  });
  const avgSales = discounts.map(d => {
    const rows = data.filter(r => r.discount === d);
    return rows.length > 0 ? sum(rows, 'sales') / rows.length : 0;
  });

  CHARTS['discount'] = new Chart(document.getElementById('chart-discount'), {
    type: 'bar',
    data: {
      labels: discounts.map(d => d + '% Discount'),
      datasets: [
        {
          label: 'Avg Profit',
          data: avgProfit,
          backgroundColor: [PAL.green + 'bb', PAL.blue + 'bb', PAL.orange + 'bb', PAL.pink + 'bb'],
          borderColor:     [PAL.green, PAL.blue, PAL.orange, PAL.pink],
          borderWidth: 1.5,
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Avg Sales',
          data: avgSales,
          type: 'line',
          borderColor: PAL.purple,
          backgroundColor: 'rgba(123,94,167,0.15)',
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: PAL.purple,
          tension: 0.3,
          yAxisID: 'y',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmtFull(ctx.raw)}` }
        }
      },
      scales: {
        x: axisDefaults(),
        y: { ...axisDefaults(), ticks: { color: PAL.muted, callback: v => fmt(v) } }
      }
    }
  });
}

/* ── Top 5 / Bottom 5 Products ── */
function renderProductTables(data) {
  const m = groupBy(data, 'product', 'sales');
  const products = Object.keys(m).sort((a, b) => m[b] - m[a]);
  const maxSales = m[products[0]] || 1;

  function makeTable(list, isTop) {
    if (list.length === 0) return '<div class="no-data"><div class="no-data-icon">📭</div>No data</div>';
    const rows = list.map((prod, i) => {
      const s = m[prod];
      const pct = (s / maxSales * 100).toFixed(0);
      const rankClass = isTop ? 'rank-top' : 'rank-bottom';
      const barClass  = isTop ? 'bar-top'  : 'bar-bottom';
      return `<tr>
        <td class="rank ${rankClass}">${isTop ? (i + 1) : (products.length - list.length + i + 1)}</td>
        <td><strong>${prod}</strong></td>
        <td style="text-align:right">${fmtFull(s)}
          <span class="bar-inline ${barClass}" style="width:${Math.max(pct * 0.6, 8)}px"></span>
        </td>
      </tr>`;
    });
    return `<table class="product-table">
      <thead><tr><th>#</th><th>Product</th><th style="text-align:right">Sales</th></tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>`;
  }

  const top5    = products.slice(0, 5);
  const bottom5 = products.slice(-5).reverse();
  document.getElementById('table-top5').innerHTML    = makeTable(top5,    true);
  document.getElementById('table-bottom5').innerHTML = makeTable(bottom5, false);
}

/* ════════════════════════════════════════════════════
   RENDER ALL
════════════════════════════════════════════════════ */
function renderAll() {
  const data = filteredData;
  renderKPIs(data);
  renderMonthly(data);
  renderCity(data);
  renderCategory(data);
  renderRep(data);
  renderPayment(data);
  renderProfitability(data);
  renderDiscount(data);
  renderProductTables(data);
}

/* ── Init on page load ── */
document.addEventListener('DOMContentLoaded', () => {
  filteredData = [...RAW_DATA];
  renderAll();
});
