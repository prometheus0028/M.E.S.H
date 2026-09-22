import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon, LightBulbIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'

// We'll replace efficiencyData with live state
const initialEfficiencyData = [
  { time: '0', value: 85 },
  { time: '1', value: 88 },
  { time: '2', value: 92 },
  { time: '3', value: 90 },
  { time: '4', value: 87 },
  { time: '5', value: 94 },
]

const anomalyData = [
  { name: 'Machine A', equipment: 4, process: 2, safety: 1 },
  { name: 'Machine B', equipment: 1, process: 5, safety: 0 },
  { name: 'Machine C', equipment: 3, process: 1, safety: 2 },
  { name: 'Machine D', equipment: 2, process: 3, safety: 4 },
]

const recentAlerts = [
  { id: 1, time: '14:23', type: 'Equipment', message: 'Vibration anomaly detected on Lathe 3', severity: 'Medium' },
  { id: 2, time: '13:10', type: 'Fault', message: 'Temperature critical on Compressor B', severity: 'High' },
  { id: 3, time: '11:45', type: 'Safety', message: 'Proximity sensor triggered in Zone 4', severity: 'Medium' },
  { id: 4, time: '09:30', type: 'Process', message: 'Cycle time deviation > 5%', severity: 'Low' },
]

const machineStatus = [
  { id: 'M-001', name: 'CNC Router Alpha', status: 'Normal', score: 98 },
  { id: 'M-002', name: 'Lathe Series X', status: 'Warning', score: 72 },
  { id: 'M-003', name: 'Compressor Unit', status: 'Normal', score: 95 },
  { id: 'M-004', name: 'Assembly Arm B', status: 'Critical', score: 45 },
]

export default function Overview() {
  const [prediction, setPrediction] = useState({ rul: 142, faultProb: 12.4, interval: [130, 150] });
  const [efficiencyData, setEfficiencyData] = useState(initialEfficiencyData);
  const [machineStatusState, setMachineStatusState] = useState(machineStatus);
  const [anomalyDataState, setAnomalyDataState] = useState(anomalyData);
  const [efficiencyKpi, setEfficiencyKpi] = useState("92.4%");

  useEffect(() => {
    let windowIndex = 0;
    
    const pollBackend = async () => {
      try {
        // Fetch raw data window from backend simulator
        const dataRes = await axios.get(`http://localhost:8002/data/window/cmapss_fd001/unit_001/${windowIndex}`);
        const windowData = dataRes.data.data;
        
        // Map temperature array to line chart data
        if (windowData.temperature && windowData.temperature.length > 0) {
          // Take the last 20 points to simulate a sliding window
          const slice = windowData.temperature.slice(-20);
          setEfficiencyData(slice.map((val: number, idx: number) => ({
            time: `+${idx}s`,
            value: val
          })));
        }
        
        // POST to inference endpoint
        const predictRes = await axios.post('http://localhost:8002/predict', {
          dataset_id: 'cmapss_fd001',
          dataset_version: 'v1',
          run_id: 'unit_001',
          window: windowData,
          modality_mask: { temperature: 1, vibration: 1, pressure: 1 }
        });
        
        if (predictRes.data?.prediction?.rul) {
          const rul = predictRes.data.prediction.rul;
          const faultProb = (predictRes.data.prediction.anomaly_score * 100) || 12.4;
          
          setPrediction({
            rul: rul,
            faultProb: faultProb,
            interval: predictRes.data.uncertainty.rul_interval || [130, 150]
          });
          
          // Update machine status dynamically for M-001
          setMachineStatusState(prev => prev.map(m => {
            if (m.id === 'M-001') {
              let status = 'Normal';
              if (rul < 80) status = 'Warning';
              if (rul < 40) status = 'Critical';
              return { ...m, score: Math.round(Math.max(0, 100 - faultProb)), status };
            }
            return m;
          }));
          
          // Update anomaly data dynamically for Machine A (M-001)
          setAnomalyDataState(prev => prev.map(a => {
            if (a.name === 'Machine A') {
              return {
                ...a,
                equipment: Math.max(1, Math.round(faultProb / 10)),
                process: Math.max(1, Math.round(faultProb / 15)),
              };
            }
            return a;
          }));
          
          // Update overall efficiency KPI based on the fault probability
          const eff = Math.min(100, Math.max(0, 100 - (faultProb * 0.5))).toFixed(1);
          setEfficiencyKpi(`${eff}%`);
        }
        
        windowIndex += 1;
      } catch (err) {
        console.error("Failed to poll backend", err);
      }
    };

    const interval = setInterval(pollBackend, 2000);
    pollBackend(); // Initial call

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Production Efficiency" 
          value={efficiencyKpi} 
          trend="Live Updates" 
          trendUp={true} 
          icon={<ArrowTrendingUpIcon className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard 
          title="Active Machines" 
          value="42 / 45" 
          trend="93% Operational" 
          trendUp={true}
          icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />}
        />
        <KpiCard 
          title="Detected Anomalies" 
          value="7" 
          trend="-2 since yesterday" 
          trendUp={true}
          icon={<ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard 
          title="Safety Status" 
          value="Good" 
          trend="0 Critical Incidents" 
          trendUp={true}
          icon={<ShieldExclamationIcon className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      {/* Middle Row: Table and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Machine Status Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Machine Health Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Machine</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {machineStatusState.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{m.id}</div>
                      <div className="text-xs text-gray-400">{m.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        m.status === 'Normal' ? 'bg-green-100 text-green-700' :
                        m.status === 'Warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{m.score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Anomaly Detection Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Anomaly Detection</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalyDataState} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="equipment" name="Equipment" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="process" name="Process" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="safety" name="Safety" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Live Sensor Stream (Temperature)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Recent Alerts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-500">{alert.time}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-700">{alert.type}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{alert.message}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === 'Low' ? 'bg-gray-100 text-gray-600' :
                        alert.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Predictions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Model Predictions</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Machine Failure Risk</div>
              <div className="text-2xl font-bold text-gray-800">{prediction.faultProb.toFixed(1)}%</div>
              <div className="text-xs text-green-600 mt-1 font-medium">Live Updates Active</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Estimated RUL</div>
              <div className="text-2xl font-bold text-gray-800">{prediction.rul}<span className="text-sm font-normal text-gray-500 ml-1">cycles</span></div>
              <div className="text-xs text-gray-500 mt-1 font-medium">Interval: [{prediction.interval[0]}, {prediction.interval[1]}]</div>
            </div>
          </div>

          <div className="mt-auto bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
            <LightBulbIcon className="text-blue-500 shrink-0 mt-0.5 w-5 h-5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800">AI Insight</h4>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                Lathe Series X (M-002) is showing degraded performance patterns in vibration. Maintenance recommended within 48 hours to prevent unplanned downtime.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

function KpiCard({ title, value, trend, trendUp, icon }: { title: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-2">{value}</div>
      <div className={`text-xs font-medium flex items-center ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
        {trend}
      </div>
    </div>
  )
}
