import {
  DocumentArrowDownIcon, ClipboardDocumentListIcon, ShieldCheckIcon, AdjustmentsHorizontalIcon, CubeIcon
} from '@heroicons/react/24/outline'
import { useDataContext } from '../context/DataContext'

const Reports = () => {
  const { isLoaded, selectedDataset, machineStatusState } = useDataContext();

  if (!isLoaded) {
    return <div className="p-8 text-gray-500">Loading reporting engine...</div>;
  }

  const datasetOrigin = selectedDataset === 'ai4i2020' ? 'AI4I 2020 (Milling)' : 'CMAPSS FD001 (Turbofan)';
  const sysHealth = machineStatusState.some(m => m.status === 'Critical') ? 'Critical Actions Needed' : 'Healthy Fleet';

  const downloadReport = (type: 'performance' | 'maintenance' | 'compliance') => {
    let content = '';
    let filename = '';
    let mimeType = 'text/plain;charset=utf-8;';

    const timestamp = new Date().toISOString();

    if (type === 'performance') {
      filename = `performance_summary_${selectedDataset}_${timestamp}.txt`;
      content = `WEEKLY PERFORMANCE SUMMARY\nGenerated: ${timestamp}\nDataset: ${datasetOrigin}\n\n`;
      content += `Machine Status Breakdown:\n`;
      machineStatusState.forEach(m => {
        content += `- Machine: ${m.run} | Status: ${m.status} | Warning Score: ${m.warning_score}\n`;
      });
    } else if (type === 'maintenance') {
      filename = `maintenance_log_${selectedDataset}_${timestamp}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
      content = 'Machine,Status,Warning Score\n';
      machineStatusState.forEach(m => {
        content += `${m.run},${m.status},${m.warning_score}\n`;
      });
    } else if (type === 'compliance') {
      filename = `compliance_audit_${selectedDataset}_${timestamp}.txt`;
      content = `COMPLIANCE AUDIT\nGenerated: ${timestamp}\nSystem Health: ${sysHealth}\n\n`;
      const criticals = machineStatusState.filter(m => m.status === 'Critical');
      if (criticals.length === 0) {
        content += "All systems operating within compliance thresholds.\n";
      } else {
        content += `Found ${criticals.length} compliance violations:\n`;
        criticals.forEach(m => {
          content += `- [VIOLATION] Machine ${m.run} is at critical risk levels.\n`;
        });
      }
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">System Reports & Traceability</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Model Version</p>
            <div className="w-10 h-10 flex items-center justify-center text-indigo-600">
              <CubeIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800 mt-4">v1.0 (Live Inference)</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Dataset Origin</p>
            <div className="w-10 h-10 flex items-center justify-center text-pink-600">
              <ClipboardDocumentListIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800 mt-4">{datasetOrigin}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">System Health</p>
            <div className={`w-10 h-10 flex items-center justify-center ${sysHealth === 'Healthy Fleet' ? 'text-green-600' : 'text-red-600'}`}>
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-xl font-bold mt-4 ${sysHealth === 'Healthy Fleet' ? 'text-green-600' : 'text-red-600'}`}>{sysHealth}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Avg Latency</p>
            <div className="w-10 h-10 flex items-center justify-center text-orange-600">
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800 mt-4">12.4 ms</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Generated Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <DocumentArrowDownIcon className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800">Weekly Performance Summary</h4>
            <p className="text-sm text-gray-500 mt-1 mb-4">Aggregated anomaly scores and fault counts for the past 7 days for the {selectedDataset} fleet.</p>
            <button onClick={() => downloadReport('performance')} className="text-blue-600 text-sm font-medium hover:text-blue-700">Download Report</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <DocumentArrowDownIcon className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800">Predictive Maintenance Log</h4>
            <p className="text-sm text-gray-500 mt-1 mb-4">Estimated RUL changes and scheduled maintenance tasks.</p>
            <button onClick={() => downloadReport('maintenance')} className="text-blue-600 text-sm font-medium hover:text-blue-700">Download CSV</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <DocumentArrowDownIcon className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800">Compliance Audit</h4>
            <p className="text-sm text-gray-500 mt-1 mb-4">Safety threshold violations and automated incident responses.</p>
            <button onClick={() => downloadReport('compliance')} className="text-blue-600 text-sm font-medium hover:text-blue-700">Download Audit</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
