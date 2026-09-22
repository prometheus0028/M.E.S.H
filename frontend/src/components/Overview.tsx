import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon, LightBulbIcon, ShieldExclamationIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useDataContext } from '../context/DataContext'

export default function Overview() {
  const { 
    totalMachines, 
    machineStatusState, 
    anomalyDataState, 
    efficiencyData, 
    prediction,
    setSelectedMachine, 
    isLoaded 
  } = useDataContext();

  const [modalType, setModalType] = useState<'Warning' | 'Critical' | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Connecting to Backend and loading model checkpoints...</p>
      </div>
    );
  }

  const warningList = machineStatusState.filter(m => m.status === 'Warning');
  const criticalList = machineStatusState.filter(m => m.status === 'Critical');
  
  // Fleet efficiency based on average health score
  const batchEfficiency = machineStatusState.length > 0 
    ? machineStatusState.reduce((acc, m) => acc + m.score, 0) / machineStatusState.length 
    : 100;

  const Modal = () => {
    if (!modalType) return null;
    const list = modalType === 'Warning' ? warningList : criticalList;
    const title = modalType === 'Warning' ? 'Units with Warnings' : 'Units with Critical Failures';
    const color = modalType === 'Warning' ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className={`text-lg font-bold ${color}`}>{title} ({list.length})</h3>
            <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {list.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No units in this state.</p>
            ) : (
              list.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800">{m.id}</p>
                    <p className="text-sm text-gray-500">CHI Score: {m.score}%</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedMachine(m.id); setModalType(null); }}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Modal />
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center text-blue-600">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Active Units</p>
            <p className="text-2xl font-bold text-gray-800">{totalMachines}</p>
          </div>
        </div>
        
        <div 
          onClick={() => setModalType('Warning')}
          className="p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-yellow-300 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 flex items-center justify-center text-yellow-600">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Warnings <span className="text-xs font-normal text-blue-500 ml-1">(Click to view)</span></p>
            <p className="text-2xl font-bold text-gray-800">{warningList.length}</p>
          </div>
        </div>

        <div 
          onClick={() => setModalType('Critical')}
          className="p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-red-300 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 flex items-center justify-center text-red-600">
            <ShieldExclamationIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Critical Failures <span className="text-xs font-normal text-blue-500 ml-1">(Click to view)</span></p>
            <p className="text-2xl font-bold text-gray-800">{criticalList.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 group">
          <div className="w-12 h-12 flex items-center justify-center text-green-600 relative">
            <ArrowTrendingUpIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Fleet CHI Efficiency</p>
            <p className="text-2xl font-bold text-gray-800">{batchEfficiency.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Prediction Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-blue-500" />
                Live Sensor Stream
              </h3>
              <p className="text-sm text-gray-500 mt-1">Real-time aggregated telemetry vector for the selected unit, fed into PyTorch.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg relative group">
              <p className="text-sm text-gray-500 font-medium">Estimated RUL</p>
              <p className="text-xl font-bold text-gray-800">
                {prediction.rul.toFixed(1)} <span className="text-sm font-normal text-gray-500">cycles</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">95% CI: [{prediction.interval[0].toFixed(1)} - {prediction.interval[1].toFixed(1)}]</p>
              <div className="absolute top-full left-0 mt-2 bg-gray-800 text-white text-xs rounded p-2 hidden group-hover:block w-48 z-10 shadow-lg">
                The Remaining Useful Life predicted by the model before complete structural failure.
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg relative group">
              <p className="text-sm text-gray-500 font-medium">Composite Health Index (CHI)</p>
              <p className={`text-xl font-bold ${prediction.faultProb > 50 ? 'text-red-500' : 'text-green-500'}`}>
                {prediction.faultProb.toFixed(1)}<span className="text-sm font-normal text-gray-500">% Anomaly</span>
              </p>
              <div className="absolute top-full left-0 mt-2 bg-gray-800 text-white text-xs rounded p-2 hidden group-hover:block w-64 z-10 shadow-lg">
                A synthesized risk score aggregating the ML model's raw anomaly probability (30%), RUL degradation (50%), and real-time physical sensor volatility (20%).
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} label={{ value: 'Sensor Output', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Anomalies */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Top 10 CHI Anomaly Scores</h3>
          <p className="text-xs text-gray-500 mb-6">Units currently experiencing the highest synthesized risk (CHI).</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalyDataState} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} stroke="#6b7280" />
                <RechartsTooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value}%`, 'CHI Anomaly']}
                />
                <Bar 
                  dataKey="score" 
                  fill="#ef4444" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
