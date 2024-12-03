import { useState } from 'react';
import './App.css'
import GraphDashboard from './Graph'
import TableDashboard from './TableDashboard';
import { Switch } from '@mui/material';

function App() {
  const [showTable, setShowTable] = useState(false);
  return (
    <>
      <h1 className='heading'>Senku(Web Crawler) </h1>
      <div style={{color: "#787887", position: "fixed", left: "48%", top: "30px"}}>
      <Switch
        checked={showTable}
        onChange={() => setShowTable(!showTable)}
        inputProps={{ 'aria-label': 'controlled' }}
      />
      {!showTable ? "Table View": "Graph View"}
      </div>
      

      {!showTable ? <GraphDashboard /> : <TableDashboard />}
    </>
  )
}

export default App
