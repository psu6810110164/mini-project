import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard'; // 👈 import มา
import Register from './pages/Register';

// Guard สำหรับ User ทั่วไป
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

// Guard สำหรับ Admin เท่านั้น (เพิ่มอันนี้)
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // ดึง Role มาเช็ค
  
  // ถ้ามี Token และเป็น admin ถึงจะให้ผ่าน
  return token && role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* User Route */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } 
        />

        {/* Admin Route (เพิ่มส่วนนี้) */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;