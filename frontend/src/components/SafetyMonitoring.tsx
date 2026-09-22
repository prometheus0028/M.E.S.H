import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { BellAlertIcon, ShieldCheckIcon, HandRaisedIcon } from '@heroicons/react/24/outline'
import { useDataContext } from '../context/DataContext'
import { useState, useEffect } from 'react'

const SafetyMonitoring = () => {
  const { efficiencyData, prediction, machineStatusState, isLoaded, selectedDataset, selectedMachine } = useDataContext();
  const [telemetry, setTelemetry] = useState<any[]>([]);

  useEffect(() => {
    // Generate dual-axis telemetry based on the efficiencyData stream
    if (efficiencyData.length > 0) {
      setTelemetry(efficiencyData.map(d => ({
        time: d.time,
        metric1: d.value, // Temp
        metric2: selectedDataset === 'ai4i2020' ? d.value * 0.4 + 20 : d.value * 0.2 + 50 // Torque / Pressure
      })));
    }
  }, [efficiencyData, selectedDataset]);

  if (!isLoaded) {
    return <div className="p-8 text-gray-500">Loading safety metrics...</div>;
  }

  const criticalMachines = machineStatusState.filter(m => m.status === 'Critical').length;
  const safetyScore = 100 - (prediction.faultProb * 0.5) - (criticalMachines * 5);
  
  const m1Name = selectedDataset === 'ai4i2020' ? 'Temp (K)' : 'Temp (R)';
  const m2Name = selectedDataset === 'ai4i2020' ? 'Torque (Nm)' : 'Pressure (psi)';
  const m1Limit = selectedDataset === 'ai4i2020' ? 320 : 600;
  const m2Limit = selectedDataset === 'ai4i2020' ? 60 : 150;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Active Fleet Alarms</p>
            <div className={`w-10 h-10 flex items-center justify-center ${criticalMachines > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              <BellAlertIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">{criticalMachines}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Overall Safety Score</p>
            <div className={`w-10 h-10 flex items-center justify-center ${safetyScore < 70 ? 'text-orange-600' : 'text-green-600'}`}>
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">{Math.max(0, safetyScore).toFixed(1)} / 100</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Safety Status ({selectedMachine})</p>
            <div className="w-10 h-10 flex items-center justify-center text-blue-600">
              <HandRaisedIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">{prediction.rul < 40 ? 'Critical Risk' : (prediction.rul < 80 ? 'Warning' : 'Safe')}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-semibold text-gray-800">Critical Sensor Telemetry ({selectedMachine})</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span> {m1Name}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span> {m2Name}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">Monitoring physical limits of critical operational sensors to prevent catastrophic failure.</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetry}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <ReferenceLine y={m1Limit} yAxisId="left" stroke="red" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: `Limit (${m1Limit})`, fill: 'red', fontSize: 12 }} />
              <ReferenceLine y={m2Limit} yAxisId="right" stroke="red" strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: `Limit (${m2Limit})`, fill: 'red', fontSize: 12 }} />
              
              <Line yAxisId="left" type="monotone" dataKey="metric1" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{r: 4}} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="metric2" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{r: 4}} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Compliance & Alerts</h3>
          <p className="text-sm text-gray-500 mt-1">Automated logging of regulatory and safety policy violations.</p>
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
              {prediction.faultProb > 70 && (
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">Just now</td>
                  <td className="px-6 py-4 font-medium text-gray-800">High Anomaly Variance Detected</td>
                  <td className="px-6 py-4 text-gray-500">OSHA 1910.119 (Process Safety)</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-medium">Review Required</span></td>
                </tr>
              )}
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
