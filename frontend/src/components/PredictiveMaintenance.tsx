
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts'
import { WrenchScrewdriverIcon, ClockIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

const comparisonData = [
  { modality: 'All Sensors (Baseline)', rul: 120, confidence: 95 },
  { modality: 'No Vibration (Simulated)', rul: 85, confidence: 70 },
  { modality: 'No Temperature (Simulated)', rul: 110, confidence: 88 },
]

const PredictiveMaintenance = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Estimated RUL</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
              <ClockIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">120 <span className="text-base font-normal text-gray-500">cycles</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Degradation Rate</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-orange-600">
              <ArrowTrendingDownIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">-0.8% <span className="text-base font-normal text-gray-500">/ hr</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Next Maintenance</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-green-600">
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">In 5 Days</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">A/B Modality Comparison</h3>
        <p className="text-sm text-gray-500 mb-6">Evaluating model robustness when specific sensors fail.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="modality" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="rul" name="Predicted RUL (cycles)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="confidence" name="Confidence (%)" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Maintenance Schedule</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Estimated Duration</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">Replace Spindle Bearing</td>
                <td className="px-6 py-4"><span className="text-red-600 font-medium">High</span></td>
                <td className="px-6 py-4 text-gray-500">4 Hours</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">Scheduled</span></td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">Coolant Flush</td>
                <td className="px-6 py-4"><span className="text-gray-600 font-medium">Low</span></td>
                <td className="px-6 py-4 text-gray-500">1 Hour</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PredictiveMaintenance
