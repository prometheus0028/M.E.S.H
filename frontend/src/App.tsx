import { useState } from 'react'
import {
  Squares2X2Icon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

import { useDataContext } from './context/DataContext'
import Overview from './components/Overview'
import FaultDetection from './components/FaultDetection'
import PredictiveMaintenance from './components/PredictiveMaintenance'
import SafetyMonitoring from './components/SafetyMonitoring'
import DataInsights from './components/DataInsights'
import Reports from './components/Reports'

function App() {
  const [activeTab, setActiveTab] = useState('Overview')
  const { selectedDataset, setSelectedDataset, selectedMachine, setSelectedMachine, allMachines } = useDataContext()

  const navItems = [
    { name: 'Overview', icon: Squares2X2Icon },
    { name: 'Fault Detection', icon: ExclamationTriangleIcon },
    { name: 'Predictive Maintenance', icon: WrenchScrewdriverIcon },
    { name: 'Safety Monitoring', icon: ShieldCheckIcon },
    { name: 'Data Insights', icon: ChartBarIcon },
    { name: 'Reports', icon: DocumentTextIcon },
  ]

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Overview':
        return <Overview />
      case 'Fault Detection':
        return <FaultDetection />
      case 'Predictive Maintenance':
        return <PredictiveMaintenance />
      case 'Safety Monitoring':
        return <SafetyMonitoring />
      case 'Data Insights':
        return <DataInsights />
      case 'Reports':
        return <Reports />
      default:
        return <Overview />
    }
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-slate-300 flex flex-col shadow-lg z-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white tracking-wider">M.E.S.H</h1>
          <p className="text-xs text-slate-400 mt-1">Multisensor Engine for System Health</p>
        </div>
        
        <nav className="flex-1 mt-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.name
              return (
                <li key={item.name}>
                  <button
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                      isActive 
                        ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500 font-medium' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
            <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                System Online
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium ml-4">Unit:</span>
            <select 
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 min-w-[140px]"
            >
              {allMachines.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            
            <span className="text-sm text-gray-500 font-medium ml-4">Dataset:</span>
            <select 
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 min-w-[240px]"
            >
              <option value="cmapss_fd001">CMAPSS (Turbofan Engines)</option>
              <option value="ai4i2020">AI4I (Milling Machines)</option>
            </select>
          </div>
        </header>

        {/* Dynamic View rendering */}
        <div className="p-8 flex-1">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  )
}

export default App
