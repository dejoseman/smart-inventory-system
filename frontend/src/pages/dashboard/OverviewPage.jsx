import { useState, useEffect } from 'react';
import { reportService } from '../../services';
import {
  Package, Users, DollarSign, ShoppingCart, AlertTriangle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const CHART_COLORS = ['#2563EB', '#0F172A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getDashboard()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div className="animate-pulse" style={{ fontSize: '1.125rem', color: 'var(--text-muted)' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, revenue_trends, monthly_sales, category_distribution, top_products, recent_transactions, low_stock_alerts } = data;

  const kpiCards = [
    { label: 'TOTAL PRODUCTS', value: kpis.total_products, icon: Package, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'TOTAL CUSTOMERS', value: kpis.total_customers, icon: Users, color: '#10B981', bg: '#ECFDF5' },
    { label: 'TOTAL REVENUE', value: `$${kpis.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: '#0F172A', bg: '#F1F5F9' },
    { label: 'TOTAL SALES', value: kpis.total_sales, icon: ShoppingCart, color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Hero Section */}
      <div className="animate-fade-in">
        <span className="eyebrow">BUSINESS OVERVIEW</span>
        <h1 className="heading-editorial" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.5rem' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9375rem' }}>
          Real-time insights into your inventory and sales performance.
        </p>
      </div>

      {/* KPI Cards - Dark Strip */}
      <div
        className="card-dark animate-fade-in stagger-1"
        style={{ padding: '1.5rem 2rem', borderRadius: '1rem' }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
        }}>
          {kpiCards.map((card, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <card.icon size={22} color="white" />
              </div>
              <div>
                <div style={{
                  fontSize: '0.6875rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem',
                }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      {low_stock_alerts?.length > 0 && (
        <div
          className="animate-fade-in stagger-2"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.75rem',
            background: 'var(--warning-faint)',
            border: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={20} color="var(--warning)" />
          <span style={{ fontWeight: 600, color: '#92400E', fontSize: '0.875rem' }}>
            {low_stock_alerts.length} product{low_stock_alerts.length > 1 ? 's' : ''} running low on stock
          </span>
          <span style={{ color: '#B45309', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>
            {low_stock_alerts.slice(0, 3).map(a => a.name).join(', ')}
            {low_stock_alerts.length > 3 ? ` +${low_stock_alerts.length - 3} more` : ''}
          </span>
        </div>
      )}

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Revenue Trends */}
        <div className="card animate-fade-in stagger-2" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="eyebrow">REVENUE ANALYTICS</span>
            <h2 className="heading-editorial" style={{ fontSize: '1.375rem', marginTop: '0.375rem' }}>
              Revenue Trends
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenue_trends}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '0.8125rem',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Sales */}
        <div className="card animate-fade-in stagger-3" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="eyebrow">SALES PERFORMANCE</span>
            <h2 className="heading-editorial" style={{ fontSize: '1.375rem', marginTop: '0.375rem' }}>
              Monthly Sales
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly_sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="month"
                tickFormatter={(m) => {
                  const [y, mo] = m.split('-');
                  return new Date(y, mo - 1).toLocaleDateString('en-US', { month: 'short' });
                }}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '0.8125rem',
                }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#0F172A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution + Top Products */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Category Distribution */}
        <div className="card animate-fade-in stagger-3" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="eyebrow">PRODUCT INSIGHTS</span>
            <h2 className="heading-editorial" style={{ fontSize: '1.375rem', marginTop: '0.375rem' }}>
              Category Distribution
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={category_distribution.filter(c => c.product_count > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="product_count"
                nameKey="name"
              >
                {category_distribution.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '0.75rem', fontSize: '0.8125rem', boxShadow: 'var(--shadow-md)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginTop: '0.5rem', justifyContent: 'center' }}>
            {category_distribution.filter(c => c.product_count > 0).map((cat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="card animate-fade-in stagger-4" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="eyebrow">BEST PERFORMERS</span>
            <h2 className="heading-editorial" style={{ fontSize: '1.375rem', marginTop: '0.375rem' }}>
              Top Selling Products
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {top_products?.slice(0, 7).map((product, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.625rem',
                  background: i === 0 ? 'var(--royal-faint)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    width: 24, height: 24,
                    borderRadius: '50%',
                    background: i === 0 ? 'var(--royal)' : 'var(--border-light)',
                    color: i === 0 ? 'white' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700,
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{product.product_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.product_sku}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{product.total_sold} sold</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>
                    ${parseFloat(product.total_revenue).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card animate-fade-in stagger-4" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="eyebrow">LIVE ACTIVITY</span>
          <h2 className="heading-editorial" style={{ fontSize: '1.375rem', marginTop: '0.375rem' }}>
            Recent Transactions
          </h2>
        </div>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Staff</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent_transactions?.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 600, color: 'var(--royal)' }}>{tx.invoice_number}</td>
                  <td>{tx.customer_name}</td>
                  <td>{tx.staff_name}</td>
                  <td style={{ fontWeight: 600 }}>${parseFloat(tx.total).toFixed(2)}</td>
                  <td>
                    <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                      {tx.payment_method}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${tx.payment_status === 'paid' ? 'badge-success' : tx.payment_status === 'pending' ? 'badge-warning' : 'badge-info'}`}>
                      {tx.payment_status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
