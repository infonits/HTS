import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SpiceHouseQueue from './pages/SpiceHouseQueue '

function App() {
  const [count, setCount] = useState(0)

  return (
  <>
  <SpiceHouseQueue/>
  </>
  )
}

export default App
