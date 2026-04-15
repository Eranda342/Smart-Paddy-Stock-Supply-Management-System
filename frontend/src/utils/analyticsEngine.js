// ============================================================================
// analyticsEngine.js — Production analytics engine
// Supports: 7d (7 daily pts), 30d (30 daily pts), 1y (12 monthly pts), custom
// Used by: Admin Reports · Farmer Dashboard · Mill Owner Dashboard
// ============================================================================

// ---------------------------------------------------------------------------
// getRangeDates
// Returns { startDate: Date, endDate: Date } for any supported range.
// Uses LOCAL calendar dates — no UTC/ISO offset surprises.
// ---------------------------------------------------------------------------
export function getRangeDates(range, customRange) {
  // Custom range takes priority
  if (customRange && customRange.startDate && customRange.endDate) {
    const start = new Date(customRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(customRange.endDate);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (range === '7d') {
    // Last 7 days INCLUDING today → go back 6 days
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: today };
  }

  if (range === '30d') {
    // Last 30 days INCLUDING today → go back 29 days
    const start = new Date();
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: today };
  }

  if (range === '1y') {
    // Last 12 months INCLUDING current month → go back 11 months
    const start = new Date();
    start.setDate(1);
    start.setMonth(start.getMonth() - 11);
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: today };
  }

  // Fallback: same as 1y
  const start = new Date();
  start.setDate(1);
  start.setMonth(start.getMonth() - 11);
  start.setHours(0, 0, 0, 0);
  return { startDate: start, endDate: today };
}

// ---------------------------------------------------------------------------
// filterByDate
// Filters an array of records to the given date window (inclusive).
// Accepts Date objects or ISO strings for startDate/endDate.
// ---------------------------------------------------------------------------
export function filterByDate(data, startDate, endDate) {
  if (!data || !Array.isArray(data)) return [];
  const start = new Date(startDate).getTime();
  const end   = new Date(endDate).getTime();
  return data.filter(item => {
    const ts = new Date(item.createdAt || item.date || item.timestamp).getTime();
    return ts >= start && ts <= end;
  });
}

// ---------------------------------------------------------------------------
// _localDateKey — timezone-safe daily key: "YYYY-M-D"
// Uses local calendar fields (year/month/date) — NOT toISOString() which
// can shift the day when the host is UTC+5:30 etc.
// ---------------------------------------------------------------------------
function _localDateKey(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ---------------------------------------------------------------------------
// _localMonthKey — "YYYY-MM" using local fields
// ---------------------------------------------------------------------------
function _localMonthKey(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}`;
}

// ---------------------------------------------------------------------------
// _getAmount — safely extract monetary value from a transaction
// ---------------------------------------------------------------------------
function _getAmount(t) {
  if (t.totalAmount)    return t.totalAmount;
  if (t.price)          return t.price;
  if (t.finalPricePerKg && t.quantityKg) return t.finalPricePerKg * t.quantityKg;
  return 0;
}

// ---------------------------------------------------------------------------
// _isDaily — decide daily vs monthly grouping.
//
// Priority order (IMPORTANT — customRange is evaluated first):
//   1. customRange present → span-based: daily ≤ 60 days, monthly > 60 days
//   2. '7d' / '30d'        → always daily
//   3. '1y' or anything else → always monthly
//
// customRange is checked FIRST so it takes priority over the range string.
// This matters because dashboards set range='all'/'1y'/'custom' while
// simultaneously setting appliedCustomRange — the range string must not
// override the custom window logic.
// ---------------------------------------------------------------------------
function _isDaily(range, customRange, start, end) {
  // 1. Custom range → decide purely by span, ignore range string
  if (customRange && start && end) {
    const diffDays = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
  }
  // 2. Fixed ranges
  if (range === '7d' || range === '30d') return true;
  // 3. 1y / fallback → monthly
  return false;
}

// ---------------------------------------------------------------------------
// computeTrendData
//
// • 7d     → exactly  7 daily  points
// • 30d    → exactly 30 daily  points
// • 1y     → exactly 12 monthly points
// • custom ≤ 60 days → daily  (Apr 1–Apr 14 = 14 pts, no gaps)
// • custom > 60 days → monthly
//
// All slots zero-initialised — no fake spikes, no missing dates.
// ---------------------------------------------------------------------------
export function computeTrendData(transactions, startDate, endDate, range, customRange) {
  // Normalise to Date objects
  const start = new Date(startDate);
  const end   = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const daily = _isDaily(range, customRange, start, end);

  // ── DEBUG ─────────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    console.log(`[analyticsEngine] range=${range} customRange=${!!customRange} diffDays=${diffDays} daily=${daily} txns=${transactions.length}`);
    if (transactions.length > 0) {
      console.log('[analyticsEngine] Sample:', transactions.slice(0, 3).map(t => ({ id: t._id, date: t.createdAt, amount: _getAmount(t) })));
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (daily) {
    // ── DAILY PATH ───────────────────────────────────────────────────────
    // 1. Build ordered list of local date keys & zero-map
    const orderedKeys = [];
    const map = {};
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = _localDateKey(cursor);
      orderedKeys.push(key);
      map[key] = 0;
      cursor.setDate(cursor.getDate() + 1);
    }

    // 2. Aggregate transactions into the map using local date keys
    transactions.forEach(t => {
      const d   = new Date(t.createdAt || t.date || t.timestamp);
      const key = _localDateKey(d);
      if (map[key] !== undefined) {
        map[key] += _getAmount(t);
      }
    });

    // 3. Format labels & return — guaranteed chronological, no gaps
    return orderedKeys.map(key => {
      const [y, mo, dy] = key.split('-').map(Number);
      const label = new Date(y, mo - 1, dy)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { month: label, revenue: map[key] };
    });

  } else {
    // ── MONTHLY PATH ─────────────────────────────────────────────────────
    // 1. Build ordered list of YYYY-MM keys & zero-map
    const orderedKeys = [];
    const map = {};
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= lastMonth) {
      const key = _localMonthKey(cursor);
      orderedKeys.push(key);
      map[key] = 0;
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // 2. Aggregate transactions
    transactions.forEach(t => {
      const d   = new Date(t.createdAt || t.date || t.timestamp);
      const key = _localMonthKey(d);
      if (map[key] !== undefined) {
        map[key] += _getAmount(t);
      }
    });

    // 3. Format labels
    return orderedKeys.map(key => {
      const [y, m] = key.split('-').map(Number);
      const label = new Date(y, m - 1, 1)
        .toLocaleDateString('en-US', { month: 'short' });
      return { month: label, revenue: map[key] };
    });
  }
}

// ---------------------------------------------------------------------------
// computeDistributions
// Paddy type & district breakdowns from pre-filtered transactions.
//
// District extraction order (widest fallback chain — all known API shapes):
//   1. listing.location.district   ← primary (after backend populate fix)
//   2. listing.location (string)   ← plain string fallback
//   3. location.district           ← direct on transaction
//   4. district                    ← flat field on transaction
//   5. farmer.district             ← from farmer profile
//   null → skip (do NOT count as "Unknown") to keep chart clean
//
// "Unknown" is only returned as a single placeholder if NO district could
// be extracted from ANY transaction.
// ---------------------------------------------------------------------------
export function computeDistributions(transactions) {
  const paddy    = {};
  const district = {};

  transactions.forEach(t => {
    // ── Paddy type ──────────────────────────────────────────────────────────
    const type = t.listing?.paddyType || t.paddyType || 'Other';
    paddy[type] = (paddy[type] || 0) + (t.quantityKg || 0);

    // ── District — widest possible fallback chain ────────────────────────────
    const dist =
      t.listing?.location?.district ||
      (typeof t.listing?.location === 'string' ? t.listing.location : null) ||
      t.location?.district ||
      t.district ||
      t.farmer?.district ||
      null;

    if (dist) {
      district[dist] = (district[dist] || 0) + (t.quantityKg || 1);
    }
  });

  const paddyData = Object.entries(paddy)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  let districtData = Object.entries(district)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // cap at 8 for legible chart

  // Only show "Unknown" if truly no district data at all
  if (districtData.length === 0 && transactions.length > 0) {
    districtData = [{ name: 'Unknown', value: transactions.length }];
  }

  return { paddyData, districtData };
}

// ---------------------------------------------------------------------------
// computeStats
// KPI card values from pre-filtered transactions.
// ---------------------------------------------------------------------------
export function computeStats(transactions, listings = []) {
  const completed = transactions.filter(
    t => t.status === 'COMPLETED' || t.status === 'DELIVERED'
  );
  const revenue = completed.reduce((sum, t) => sum + _getAmount(t), 0);

  return {
    totalTransactions:   transactions.length,
    completedDeliveries: completed.length,
    ongoingTransactions: transactions.filter(
      t => t.status === 'ORDER_CREATED' ||
           t.status === 'PAYMENT_COMPLETED' ||
           t.status === 'DELIVERY_IN_PROGRESS' ||
           t.status === 'TRANSPORT_PENDING'
    ).length,
    totalRevenue:  revenue,
    activeListings: Array.isArray(listings)
      ? (listings.filter(l => l.status === 'ACTIVE').length || listings.length)
      : 0
  };
}

// ---------------------------------------------------------------------------
// computeGrowth
// Revenue growth % vs the prior equivalent period.
// Supports 7d and 30d; returns 0 for 1y / custom (no clean prior period).
// ---------------------------------------------------------------------------
export function computeGrowth(allTransactions, rangeMode, customStart, customEnd) {
  if (rangeMode === '1y' || (customStart && customEnd)) return 0;

  const now  = Date.now();
  const days = rangeMode === '7d' ? 7 : 30;
  const ms   = days * 24 * 60 * 60 * 1000;

  const currentCut = now - ms;
  const prevCut    = now - ms * 2;

  let currRev = 0, prevRev = 0;
  allTransactions.forEach(t => {
    const ts   = new Date(t.createdAt).getTime();
    const done = t.status === 'COMPLETED' || t.status === 'DELIVERED';
    if (!done) return;
    if (ts >= currentCut && ts <= now)          currRev += _getAmount(t);
    if (ts >= prevCut    && ts <  currentCut)   prevRev += _getAmount(t);
  });

  if (prevRev > 0) return ((currRev - prevRev) / prevRev) * 100;
  if (currRev > 0) return 100;
  return 0;
}

// ---------------------------------------------------------------------------
// getRangeLabel — human-readable label for the current selection
// ---------------------------------------------------------------------------
export function getRangeLabel(range, customRange) {
  if (customRange) return 'Custom Range';
  if (range === '7d')  return 'Last 7 Days';
  if (range === '30d') return 'Last 30 Days';
  if (range === '1y')  return 'Last 12 Months';
  return 'Last 12 Months';
}
