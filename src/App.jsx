import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PartySizeSelector from './pages/PartySizeSelector'
import ReservationForm from './pages/ReservationForm'
import Result from './pages/Result'
import UserPage from './pages/UserPage'
import VendorSelectionPage from './pages/VendorSelectionPage'
import { GuestProvider } from './context/guestContext'
import Dashboard from './pages/Dashboard'



function App() {
  const [count, setCount] = useState(0)

  return (
    <GuestProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/user/vendor" replace />} />
          <Route path='/user' element={<UserPage />} >
            <Route path="" element={<PartySizeSelector />} />
            <Route path="step1" element={<ReservationForm />} />
            <Route path="result" element={<Result />} />
            <Route path="vendor" element={<VendorSelectionPage />} />
          </Route>
          <Route path="/admin" element={<Dashboard />} />
        </Routes>
      </Router>
    </GuestProvider>
  )
}

export default App
