
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import { ServerStackIcon, PresentationChartLineIcon, CircleStackIcon } from '@heroicons/react/24/outline'

const rawVibration = Array.from({ length: 50 }).map((_, i) => ({
  time: i,
  ch1: Math.sin(i / 2) * 5 + Math.random() * 2,
  ch2: Math.cos(i / 3) * 3 + Math.random() * 1.5,
  ch3: Math.sin(i / 4) * 4 + Math.random() * 2,
}))

const DataInsights = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Raw Sensor Telemetry</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            Live Stream
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-indigo-600">
            <PresentationChartLineIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sampling Rate</p>
            <p className="text-xl font-bold text-gray-800">100 Hz</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-purple-600">
            <ServerStackIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Buffer Size</p>
            <p className="text-xl font-bold text-gray-800">50 Timesteps</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-teal-600">
            <CircleStackIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Data Transmitted</p>
            <p className="text-xl font-bold text-gray-800">1.2 GB / hr</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Vibration Channels (3-Axis)</h3>
        <p className="text-sm text-gray-500 mb-4">Raw windowed input fed into the model.</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rawVibration}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="ch1" stroke="#3b82f6" strokeWidth={1.5} dot={false} activeDot={{r: 4}} name="Channel 1 (X)" />
              <Line type="monotone" dataKey="ch2" stroke="#8b5cf6" strokeWidth={1.5} dot={false} activeDot={{r: 4}} name="Channel 2 (Y)" />
              <Line type="monotone" dataKey="ch3" stroke="#f43f5e" strokeWidth={1.5} dot={false} activeDot={{r: 4}} name="Channel 3 (Z)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DataInsights
