
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { BellAlertIcon, ShieldCheckIcon, HandRaisedIcon } from '@heroicons/react/24/outline'

const sensorData = Array.from({ length: 50 }).map((_, i) => ({
  time: i,
  temperature: 300 + Math.sin(i / 5) * 20 + Math.random() * 5,
  pressure: 100 + Math.cos(i / 5) * 10 + Math.random() * 2,
}))

const SafetyMonitoring = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Active Alarms</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-red-600">
              <BellAlertIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">1</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Safety Score</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-green-600">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">98.5 / 100</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Days Since Incident</p>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
              <HandRaisedIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">142</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Critical Sensor Telemetry</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span> Temp (K)
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span> Pressure (kPa)
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <ReferenceLine y={320} yAxisId="left" stroke="red" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Temp Limit (320K)', fill: 'red', fontSize: 12 }} />
              <ReferenceLine y={115} yAxisId="right" stroke="red" strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: 'Pressure Limit (115kPa)', fill: 'red', fontSize: 12 }} />
              
              <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{r: 4}} />
              <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Compliance & Alerts</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-6 py-3 font-medium">Regulation/Policy</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">10:45 AM</td>
                <td className="px-6 py-4 font-medium text-gray-800">Temperature Spiked to 318K</td>
                <td className="px-6 py-4 text-gray-500">OSHA 1910.119 (Process Safety)</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-medium">Review Required</span></td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">08:00 AM</td>
                <td className="px-6 py-4 font-medium text-gray-800">Daily Safety Check Passed</td>
                <td className="px-6 py-4 text-gray-500">Internal Policy 4A</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">Logged</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SafetyMonitoring
