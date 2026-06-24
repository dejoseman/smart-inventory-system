import { useState, useEffect } from 'react';
import { reportService } from '../../services';
import { Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [salesReport, setSalesReport] = useState(null);
  const [staffReport, setStaffReport] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    Promise.all([
      reportService.getSalesReport(params),
      reportService.getStaffReport(params),
    ]).then(([salesRes, staffRes]) => {
      setSalesReport(salesRes.data.data);
      setStaffReport(staffRes.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleExport = async (type, format) => {
    setExporting(true);
    try {
      const params = { type, format };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await reportService.exportReport(params);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report.${format === 'excel' ? 'xlsx' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-fade-in">
        <span className="eyebrow">BUSINESS INTELLIGENCE</span>
        <h1 className="heading-editorial" style={{ fontSize: '2rem', marginTop: '0.375rem' }}>Reports</h1>
      </div>

      {/* Date Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Calendar size={18} color="var(--text-muted)" />
        <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: 'auto' }} />
        <span style={{ color: 'var(--text-muted)' }}>to</span>
        <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: 'auto' }} />
        <button className="btn btn-primary btn-sm" onClick={fetchReports}>Apply</button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { label: 'PDF', format: 'pdf', type: 'sales' },
            { label: 'Excel', format: 'excel', type: 'sales' },
            { label: 'CSV', format: 'csv', type: 'sales' },
          ].map(e => (
            <button key={e.format} className="btn btn-outline btn-sm" onClick={() => handleExport(e.type, e.format)} disabled={exporting}>
              <Download size={14} /> {e.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading reports...</div>
      ) : (
        <>
          {/* Sales Summary */}
          {salesReport && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Revenue', value: `$${salesReport.summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                { label: 'Total Sales', value: salesReport.summary.total_sales },
                { label: 'Avg Sale Value', value: `$${salesReport.summary.avg_sale_value.toFixed(2)}` },
                { label: 'Total Tax', value: `$${salesReport.summary.total_tax.toFixed(2)}` },
                { label: 'Total Discounts', value: `$${salesReport.summary.total_discount.toFixed(2)}` },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{s.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)' }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Daily Breakdown Chart */}
          {salesReport?.daily_breakdown?.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <span className="eyebrow">DAILY BREAKDOWN</span>
              <h2 className="heading-editorial" style={{ fontSize: '1.375rem', marginTop: '0.375rem', marginBottom: '1rem' }}>Sales by Day</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesReport.daily_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Revenue']} contentStyle={{ borderRadius: '0.75rem', fontSize: '0.8125rem' }} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Staff Performance */}
          {staffReport.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <span className="eyebrow">TEAM PERFORMANCE</span>
              <h2 className="heading-editorial" style={{ fontSize: '1.375rem', marginTop: '0.375rem', marginBottom: '1rem' }}>Staff Sales</h2>
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="table">
                  <thead>
                    <tr><th>Staff</th><th>Email</th><th>Sales</th><th>Revenue</th><th>Avg Sale</th></tr>
                  </thead>
                  <tbody>
                    {staffReport.map((s, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                        <td><span className="badge badge-info">{s.total_sales}</span></td>
                        <td style={{ fontWeight: 700 }}>${s.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>${s.avg_sale_value.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
