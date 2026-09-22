import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

type DataContextType = {
  selectedDataset: string;
  setSelectedDataset: (val: string) => void;
  selectedMachine: string;
  setSelectedMachine: (val: string) => void;
  allMachines: string[];
  totalMachines: number;
  machineStatusState: any[];
  anomalyDataState: any[];
  efficiencyData: { time: string, value: number }[];
  prediction: { rul: number, faultProb: number, interval: number[] };
  isLoaded: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDataset, setSelectedDataset] = useState('cmapss_fd001');
  const [selectedMachine, setSelectedMachine] = useState('');
  
  const [allMachines, setAllMachines] = useState<string[]>([]);
  const [totalMachines, setTotalMachines] = useState(0);
  const [machineStatusState, setMachineStatusState] = useState<any[]>([]);
  const [anomalyDataState, setAnomalyDataState] = useState<any[]>([]);
  const [efficiencyData, setEfficiencyData] = useState<{ time: string, value: number }[]>([]);
  const [prediction, setPrediction] = useState({ rul: 0, faultProb: 0, interval: [0, 0] });
  const [isLoaded, setIsLoaded] = useState(false);

  const selectedMachineRef = useRef(selectedMachine);
  const selectedDatasetRef = useRef(selectedDataset);
  const allMachinesRef = useRef<string[]>([]);

  useEffect(() => {
    selectedMachineRef.current = selectedMachine;
  }, [selectedMachine]);

  useEffect(() => {
    selectedDatasetRef.current = selectedDataset;
  }, [selectedDataset]);

  useEffect(() => {
    const fetchSplits = async () => {
      try {
        const splitRes = await axios.get('http://localhost:8002/data/splits');
        const dataset = splitRes.data.find((d: any) => d.dataset_id === selectedDataset);
        
        if (dataset && dataset.runs && dataset.runs.length > 0) {
          const runs = dataset.runs;
          setAllMachines(runs);
          allMachinesRef.current = runs;
          setTotalMachines(runs.length);
          
          if (!runs.includes(selectedMachineRef.current)) {
            setSelectedMachine(runs[0]);
            selectedMachineRef.current = runs[0];
          }

          setMachineStatusState(runs.map((run: string) => ({
            id: run,
            name: `Unit ${run.split('_').pop()}`,
            status: 'Normal',
            score: 100,
            anomaly_score: 0
          })));

          setAnomalyDataState(runs.slice(0, 10).map((run: string) => ({
            name: run.split('_').pop(),
            score: 0
          })));
          
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to fetch splits", err);
      }
    };
    
    fetchSplits();
  }, [selectedDataset]);

  useEffect(() => {
    let windowIndex = 0;
    let tickCount = 0;
    let rollingChartData: {time: string, value: number}[] = [];
    let noiseAccumulator = 0;
    let lastPolledMachine = '';
    let lastPolledDataset = '';

    const pollBackend = async () => {
      const activeMachine = selectedMachineRef.current; 
      const activeDataset = selectedDatasetRef.current;
      const runs = allMachinesRef.current;
      
      if (runs.length === 0 || !activeMachine) return;

      if (activeMachine !== lastPolledMachine || activeDataset !== lastPolledDataset) {
        // Reset the live stream graphs and counters if the user switched context
        rollingChartData = [];
        windowIndex = 0;
        noiseAccumulator = 0;
        lastPolledMachine = activeMachine;
        lastPolledDataset = activeDataset;
      }

      try {
        const batchStart = (tickCount * 9) % Math.max(1, runs.length - 1);
        const rotatingBatch = runs.filter(r => r !== activeMachine).slice(batchStart, batchStart + 9);
        const currentBatch = [activeMachine, ...rotatingBatch];

        const updates = await Promise.all(currentBatch.map(async (run) => {
          try {
             const dataRes = await axios.get(`http://localhost:8002/data/window/${activeDataset}/${run}/${windowIndex}`);
             const windowData = dataRes.data.data;
             
             // AI4I uses different modality mask config if needed, but the backend currently ignores the mask if missing or maps it.
             // We'll pass all 1s.
             const predictRes = await axios.post('http://localhost:8002/predict', {
               dataset_id: activeDataset,
               dataset_version: 'v1',
               run_id: run,
               window: windowData,
               modality_mask: { temperatures: 1, pressures: 1, speeds: 1, gas_flow: 1, operational_settings: 1, temperature: 1, speed: 1, torque: 1, tool_wear: 1 }
             });
             
             return {
               run,
               windowData,
               prediction: predictRes.data.prediction,
               uncertainty: predictRes.data.uncertainty
             };
          } catch(e) {
             console.error(`Error polling ${run}:`, e);
             return null;
          }
        }));

        const validUpdates = updates.filter(u => u !== null) as any[];
        
        const primaryUpdate = validUpdates.find(u => u.run === activeMachine);
        
        if (primaryUpdate && primaryUpdate.prediction) {
          const rul = primaryUpdate.prediction.rul || 0;
          const p_anomaly = primaryUpdate.prediction.anomaly_score || 0.5;
          
          // CHI Math
          const d_rul = Math.max(0, 1 - (rul / 130));
          const f_ai = Math.pow(p_anomaly, 2);
          
          let f_vol = 0;
          // Use either temperature (ai4i) or temperatures (cmapss)
          const primaryTemp = primaryUpdate.windowData.temperatures || primaryUpdate.windowData.temperature;
          if (primaryTemp && primaryTemp.length > 0) {
             const temps = primaryTemp.flat();
             const mean = temps.reduce((a:number,b:number)=>a+Number(b), 0) / temps.length;
             const variance = temps.reduce((a:number,b:number)=>a+Math.pow(Number(b)-mean, 2), 0) / temps.length;
             f_vol = Math.min(1, Math.sqrt(variance) / 5.0);
             
             const latestVal = temps[temps.length - 1];
             noiseAccumulator += (Math.random() - 0.5) * 2;
             if (noiseAccumulator > 10) noiseAccumulator -= 2;
             if (noiseAccumulator < -10) noiseAccumulator += 2;
             
             const visualVal = (latestVal * (activeDataset === 'cmapss_fd001' ? 20 : 1)) + (activeDataset === 'cmapss_fd001' ? 500 : 0) + noiseAccumulator + (Math.random() * 2 - 1);
             
             rollingChartData.push({ time: `T+${tickCount}`, value: parseFloat(visualVal.toFixed(1)) });
             if (rollingChartData.length > 20) {
               rollingChartData.shift();
             }
             setEfficiencyData([...rollingChartData]);
          }
          
          const final_anomaly = (0.5 * d_rul) + (0.3 * f_ai) + (0.2 * f_vol);
          const chi_anomaly = Math.min(100, Math.max(0, final_anomaly * 100));
          
          setPrediction({
            rul: rul,
            faultProb: chi_anomaly,
            interval: primaryUpdate.uncertainty?.rul_interval || [rul - 10, rul + 10]
          });
        }

        setMachineStatusState(prev => {
          const newState = [...prev];
          validUpdates.forEach(u => {
            if (u.prediction) {
              const rul = u.prediction.rul || 0;
              const p_anomaly = u.prediction.anomaly_score || 0.5;
              
              const d_rul = Math.max(0, 1 - (rul / 130));
              const f_ai = Math.pow(p_anomaly, 2);
              
              let f_vol = 0;
              const tempArr = u.windowData.temperatures || u.windowData.temperature;
              if (tempArr && tempArr.length > 0) {
                 const temps = tempArr.flat();
                 const mean = temps.reduce((a:number,b:number)=>a+Number(b), 0) / temps.length;
                 const variance = temps.reduce((a:number,b:number)=>a+Math.pow(Number(b)-mean, 2), 0) / temps.length;
                 f_vol = Math.min(1, Math.sqrt(variance) / 5.0);
              }
              
              const final_anomaly = (0.5 * d_rul) + (0.3 * f_ai) + (0.2 * f_vol);
              const anomaly_pct = Math.min(100, Math.max(0, final_anomaly * 100));
              const health_pct = 100 - anomaly_pct;
              
              let status = 'Normal';
              if (health_pct < 50) status = 'Critical';
              else if (health_pct < 85) status = 'Warning';
              
              const idx = newState.findIndex(m => m.id === u.run);
              if (idx !== -1) {
                newState[idx] = { 
                  ...newState[idx], 
                  score: Math.round(health_pct), 
                  anomaly_score: anomaly_pct,
                  status 
                };
              }
            }
          });
          
          const topAnomalies = [...newState]
             .sort((a, b) => (b.anomaly_score || 0) - (a.anomaly_score || 0))
             .slice(0, 10)
             .map(m => ({ name: m.id.split('_').pop(), score: parseFloat((m.anomaly_score || 0).toFixed(1)) }));
             
          setAnomalyDataState(topAnomalies);
          
          return newState;
        });
        
        windowIndex += 1;
        tickCount += 1;
      } catch (err) {
        console.error("Failed to poll backend", err);
      }
    };

    const interval = setInterval(pollBackend, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{
      selectedDataset, setSelectedDataset,
      selectedMachine, setSelectedMachine,
      allMachines, totalMachines,
      machineStatusState, anomalyDataState,
      efficiencyData, prediction, isLoaded
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataContext must be used within DataProvider');
  return context;
};
