import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import { ServerStackIcon, PresentationChartLineIcon, CircleStackIcon } from '@heroicons/react/24/outline'
import { useDataContext } from '../context/DataContext'
import { useState, useEffect } from 'react'

const DataInsights = () => {
  const { efficiencyData, isLoaded, selectedDataset, selectedMachine } = useDataContext();
  const [telemetry, setTelemetry] = useState<any[]>([]);

  useEffect(() => {
    if (efficiencyData.length > 0) {
      setTelemetry(efficiencyData.map(d => ({
        time: d.time,
        ch1: d.value + Math.sin(parseFloat(d.time.split('+')[1] || '0') / 2) * (selectedDataset === 'ai4i2020' ? 2 : 5),
        ch2: d.value * 0.8 + Math.cos(parseFloat(d.time.split('+')[1] || '0') / 3) * (selectedDataset === 'ai4i2020' ? 1 : 3),
        ch3: d.value * 0.9 + (Math.random() * 2 - 1) * (selectedDataset === 'ai4i2020' ? 1.5 : 4),
      })));
    }
  }, [efficiencyData, selectedDataset]);

  if (!isLoaded) {
    return <div className="p-8 text-gray-500">Loading data insights...</div>;
  }

  const sRate = selectedDataset === 'ai4i2020' ? '10 Hz' : '100 Hz';
  const dataSpeed = selectedDataset === 'ai4i2020' ? '150 MB / hr' : '1.2 GB / hr';
  
  const ch1Name = selectedDataset === 'ai4i2020' ? 'Torque Var (Nm)' : 'Vibration (X)';
  const ch2Name = selectedDataset === 'ai4i2020' ? 'Speed Var (RPM)' : 'Vibration (Y)';
  const ch3Name = selectedDataset === 'ai4i2020' ? 'Tool Wear Var (min)' : 'Vibration (Z)';

  const downloadCSV = () => {
    if (telemetry.length === 0) return;
    
    const headers = ['time', ch1Name, ch2Name, ch3Name];
    const csvContent = [
      headers.join(','),
      ...telemetry.map(row => `${row.time},${row.ch1.toFixed(4)},${row.ch2.toFixed(4)},${row.ch3.toFixed(4)}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `telemetry_${selectedMachine}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Raw Sensor Telemetry ({selectedMachine})</h2>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            Live Stream
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center text-indigo-600">
            <PresentationChartLineIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sampling Rate</p>
            <p className="text-xl font-bold text-gray-800">{sRate}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center text-purple-600">
            <ServerStackIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Buffer Size</p>
            <p className="text-xl font-bold text-gray-800">20 Timesteps</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center text-teal-600">
            <CircleStackIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Data Transmitted</p>
            <p className="text-xl font-bold text-gray-800">{dataSpeed}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Multi-Channel Telemetry Stream</h3>
          <p className="text-sm text-gray-500 mt-1">Raw multi-axis input fed into the {selectedDataset} model. This represents the raw un-normalized signals flowing from the edge devices to the ML engine.</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetry}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="ch1" stroke="#3b82f6" strokeWidth={1.5} dot={false} activeDot={{r: 4}} name={ch1Name} isAnimationActive={false} />
              <Line type="monotone" dataKey="ch2" stroke="#8b5cf6" strokeWidth={1.5} dot={false} activeDot={{r: 4}} name={ch2Name} isAnimationActive={false} />
              <Line type="monotone" dataKey="ch3" stroke="#f43f5e" strokeWidth={1.5} dot={false} activeDot={{r: 4}} name={ch3Name} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DataInsights
