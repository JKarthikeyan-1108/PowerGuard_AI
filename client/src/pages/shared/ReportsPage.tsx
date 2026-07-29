import { FileText, Download, Calendar, Filter, FileSpreadsheet, CheckSquare } from 'lucide-react';

const mockReports = [
  { id: 'REP-001', name: 'Monthly Consumption Report', type: 'PDF', date: 'Jul 01, 2026', size: '2.4 MB' },
  { id: 'REP-002', name: 'Theft Anomalies Q2', type: 'CSV', date: 'Jul 05, 2026', size: '1.1 MB' },
  { id: 'REP-003', name: 'Demand Forecast (Next 30 Days)', type: 'PDF', date: 'Jul 15, 2026', size: '3.8 MB' },
  { id: 'REP-004', name: 'Consumer Segmentation Export', type: 'CSV', date: 'Jul 28, 2026', size: '5.2 MB' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Reports & Exports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate, view, and download analytical reports and raw data exports.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
          <FileText className="w-4 h-4" /> Generate New Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Generators */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Quick Generators</h3>
          
          {[
            { title: 'Billing Statement', desc: 'Current month billing breakdown', icon: FileText, color: 'blue' },
            { title: 'Theft Audit Log', desc: 'Flagged meters and ML scores', icon: ShieldCheck, color: 'red' },
            { title: 'Raw Meter Data', desc: 'Time-series consumption data', icon: FileSpreadsheet, color: 'emerald' },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl hover:border-primary-500 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400 rounded-lg group-hover:bg-${item.color}-500 group-hover:text-white transition-colors`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Generated Reports List */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Reports</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <Calendar className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockReports.map((report) => (
              <div key={report.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400">
                    {report.type === 'PDF' ? <FileText className="w-8 h-8" /> : <FileSpreadsheet className="w-8 h-8" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{report.name}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{report.id}</span>
                      <span>•</span>
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 3 0 5 1 7 2a1 1 0 0 1 1 1v7z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
