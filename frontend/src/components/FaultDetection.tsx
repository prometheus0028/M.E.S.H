
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import { ExclamationCircleIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const anomalyData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  score: Math.random() > 0.8 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.2
}))

const FaultDetection = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Current Fault Class</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-red-600">
              <ExclamationCircleIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">Overheating (HDF)</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Confidence Score</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">87.4%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Anomaly Score</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-yellow-600">
              <ChartBarIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4 text-red-500">0.89</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Anomaly Score Trend (24h)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={anomalyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="score" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Recent Faults</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Fault Type</th>
                <th className="px-6 py-3 font-medium">Confidence</th>
                <th className="px-6 py-3 font-medium">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">Today, 14:32</td>
                <td className="px-6 py-4 font-medium text-gray-800">Heat Dissipation Failure (HDF)</td>
                <td className="px-6 py-4">87.4%</td>
                <td className="px-6 py-4 text-red-600 font-medium">Immediate Inspection</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">Yesterday, 09:15</td>
                <td className="px-6 py-4 font-medium text-gray-800">Tool Wear Failure (TWF)</td>
                <td className="px-6 py-4">92.1%</td>
                <td className="px-6 py-4 text-yellow-600 font-medium">Schedule Replacement</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FaultDetection
