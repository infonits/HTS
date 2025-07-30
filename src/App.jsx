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
import { QueueProvider } from './context/queueContext'
import QueueManage from './pages/QueueManage'
import QueueAnalytics from './pages/QueueAnalytics'
import TableMangement from './pages/TableMangement'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './auth/ProtectedRoutes'
import MyAccount from './pages/MyAccount'
import { AdminAuthProvider } from './context/adminAuthContext'



function App() {
  const [count, setCount] = useState(0)

  return (

    <Router>

      <Routes>
        <Route path="/" element={<Navigate to="/vendor" replace />} />

        <Route path='/rest/:slug' element={
          <GuestProvider>
            <UserPage />
          </GuestProvider>} >
          <Route path="" element={<PartySizeSelector />} />
          <Route path="step1" element={<ReservationForm />} />
          <Route path="result" element={<Result />} />
        </Route>

        <Route path="/vendor" element={<VendorSelectionPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminAuthProvider>
                <QueueProvider>
                  <Dashboard />
                </QueueProvider>
              </AdminAuthProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="queues" replace />} />
          <Route path="queues" element={<QueueManage />} />
          <Route path="account" element={<MyAccount />} />
          <Route path="analytics" element={<QueueAnalytics />} />
          <Route path="tables" element={<TableMangement />} />
        </Route>
        <Route path="login" element={<AdminAuthProvider><LoginPage /></AdminAuthProvider>} />

      </Routes>

    </Router>
  )
}

export default App
