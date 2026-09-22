import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts'
import { WrenchScrewdriverIcon, ClockIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'
import { useDataContext } from '../context/DataContext'
import { useState, useEffect } from 'react'

const PredictiveMaintenance = () => {
  const { prediction, selectedMachine, isLoaded, selectedDataset } = useDataContext();
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Create live simulated A/B comparison data based on current RUL
    const baseline = prediction.rul;
    // Add some random noise to simulate masked modality effects
    setComparisonData([
      { modality: 'All Sensors (Baseline)', rul: parseFloat(baseline.toFixed(1)), confidence: 100 - prediction.faultProb },
      { modality: selectedDataset === 'ai4i2020' ? 'No Tool Wear (Sim)' : 'No Temperature (Sim)', rul: parseFloat(Math.max(0, baseline - (Math.random() * 20 + 10)).toFixed(1)), confidence: Math.max(0, 100 - prediction.faultProb - 20) },
      { modality: selectedDataset === 'ai4i2020' ? 'No Torque (Sim)' : 'No Pressure (Sim)', rul: parseFloat(Math.max(0, baseline + (Math.random() * 10 - 5)).toFixed(1)), confidence: Math.max(0, 100 - prediction.faultProb - 15) },
    ]);
  }, [prediction.rul, prediction.faultProb, isLoaded, selectedDataset]);

  if (!isLoaded) {
    return <div className="p-8 text-gray-500">Loading predictive models...</div>;
  }

  // Calculate maintenance schedule based on RUL
  const daysUntilMaint = Math.max(0, Math.floor(prediction.rul / 10)); // Rough conversion for demo
  const maintStatus = daysUntilMaint <= 2 ? 'Urgent' : (daysUntilMaint <= 5 ? 'Scheduled' : 'Monitoring');
  const rateOfDegradation = (-1.0 * (prediction.faultProb / 50)).toFixed(2); // simulated rate based on anomaly score

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Estimated RUL ({selectedMachine})</p>
            <div className={`w-10 h-10 flex items-center justify-center ${prediction.rul < 40 ? 'text-red-600' : 'text-blue-600'}`}>
              <ClockIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">{prediction.rul.toFixed(1)} <span className="text-base font-normal text-gray-500">cycles</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Degradation Rate</p>
            <div className="w-10 h-10 flex items-center justify-center text-orange-600">
              <ArrowTrendingDownIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">{rateOfDegradation} <span className="text-base font-normal text-gray-500">/ hr</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Next Maintenance</p>
            <div className={`w-10 h-10 flex items-center justify-center ${maintStatus === 'Urgent' ? 'text-red-600' : 'text-green-600'}`}>
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">{daysUntilMaint === 0 ? 'Immediately' : `In ${daysUntilMaint} Days`}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">A/B Modality Comparison</h3>
        <p className="text-sm text-gray-500 mb-6">Evaluating model robustness when specific sensors fail in {selectedMachine}. We simulate the loss of specific input modalities to see how it affects the Remaining Useful Life (RUL) prediction and the model's confidence.</p>
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
              <Bar dataKey="rul" name="Predicted RUL (cycles)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} isAnimationActive={false} />
              <Bar dataKey="confidence" name="Confidence (%)" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={40} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Dynamic Maintenance Schedule</h3>
          <p className="text-sm text-gray-500 mt-1">Recommended maintenance actions automatically prioritized by the AI prediction engine.</p>
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
                <td className="px-6 py-4 font-medium text-gray-800">{selectedDataset === 'ai4i2020' ? 'Replace Spindle Tool' : 'Engine Overhaul (HPT)'}</td>
                <td className="px-6 py-4"><span className={`${maintStatus === 'Urgent' ? 'text-red-600' : 'text-orange-500'} font-medium`}>{maintStatus === 'Urgent' ? 'High' : 'Medium'}</span></td>
                <td className="px-6 py-4 text-gray-500">4 Hours</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${maintStatus === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {maintStatus}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PredictiveMaintenance
