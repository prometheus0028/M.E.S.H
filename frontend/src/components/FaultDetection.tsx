import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import { ExclamationCircleIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { useDataContext } from '../context/DataContext'
import { useState, useEffect } from 'react'

const FaultDetection = () => {
  const { prediction, selectedMachine, isLoaded, selectedDataset } = useDataContext();
  const [anomalyHistory, setAnomalyHistory] = useState<{time: string, score: number}[]>([]);
  const [faultLogs, setFaultLogs] = useState<{time: string, type: string, conf: number, action: string}[]>([]);

  useEffect(() => {
    // Reset history when machine changes
    setAnomalyHistory([]);
    setFaultLogs([]);
  }, [selectedMachine]);

  useEffect(() => {
    if (!isLoaded) return;
    
    setAnomalyHistory(prev => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const newHistory = [...prev, { time: timeStr, score: prediction.faultProb }];
      if (newHistory.length > 20) newHistory.shift();
      return newHistory;
    });

    if (prediction.faultProb > 80) {
      setFaultLogs(prev => {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newLog = {
          time: timeStr,
          type: selectedDataset === 'ai4i2020' ? 'Tool Wear / Overheating' : 'Engine Degradation',
          conf: prediction.faultProb,
          action: 'Immediate Inspection'
        };
        // avoid spamming logs every tick
        if (prev.length === 0 || prev[0].time !== timeStr) {
          const updated = [newLog, ...prev];
          return updated.slice(0, 5);
        }
        return prev;
      });
    }
  }, [prediction.faultProb, isLoaded, selectedDataset]);

  if (!isLoaded) {
    return <div className="p-8 text-gray-500">Loading fault detection models...</div>;
  }

  const faultClass = selectedDataset === 'ai4i2020' ? 
    (prediction.faultProb > 70 ? 'HDF / TWF Detected' : 'No Faults Detected') :
    (prediction.faultProb > 70 ? 'Degradation Detected' : 'Normal Operation');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Current Fault Class ({selectedMachine})</p>
              <p className="text-xs text-gray-400 mt-1">Classification from PyTorch Model</p>
            </div>
            <div className={`w-10 h-10 flex items-center justify-center ${prediction.faultProb > 70 ? 'text-red-600' : 'text-green-600'}`}>
              <ExclamationCircleIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">{faultClass}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Model Confidence</p>
            <div className="w-10 h-10 flex items-center justify-center text-blue-600">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">98.2%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Anomaly Score</p>
            <div className={`w-10 h-10 flex items-center justify-center ${prediction.faultProb > 50 ? 'text-red-600' : 'text-yellow-600'}`}>
              <ChartBarIcon className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-4 ${prediction.faultProb > 50 ? 'text-red-500' : 'text-gray-800'}`}>
            {(prediction.faultProb / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Live Anomaly Score Trend</h3>
          <p className="text-sm text-gray-500 mb-4">Tracking the real-time CHI risk percentage over the last 20 timesteps.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={anomalyHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [value.toFixed(1) + '%', 'Anomaly Score']}
              />
              <Area type="monotone" dataKey="score" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Recent Faults ({selectedMachine})</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Fault Type</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {faultLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No recent faults detected for this unit.</td>
                </tr>
              ) : (
                faultLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{log.time}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{log.type}</td>
                    <td className="px-6 py-4">{log.conf.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-red-600 font-medium">{log.action}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FaultDetection
