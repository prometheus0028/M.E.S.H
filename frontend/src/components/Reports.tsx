
import {
  DocumentArrowDownIcon, ClipboardDocumentListIcon, ShieldCheckIcon, AdjustmentsHorizontalIcon, CubeIcon
} from '@heroicons/react/24/outline'

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">System Reports & Traceability</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Model Version</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-indigo-600">
              <CubeIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800 mt-4">v1.0 (Dummy)</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Dataset Origin</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-pink-600">
              <ClipboardDocumentListIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800 mt-4">AI4I 2020 (Pending)</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">System Health</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-green-600">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-green-600 mt-4">Healthy</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Avg Latency</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-orange-600">
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
            <p className="text-sm text-gray-500 mt-1 mb-4">Aggregated anomaly scores and fault counts for the past 7 days.</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Download PDF</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <DocumentArrowDownIcon className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800">Predictive Maintenance Log</h4>
            <p className="text-sm text-gray-500 mt-1 mb-4">Estimated RUL changes and scheduled maintenance tasks.</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Download CSV</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <DocumentArrowDownIcon className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800">Compliance Audit</h4>
            <p className="text-sm text-gray-500 mt-1 mb-4">Safety threshold violations and automated incident responses.</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
