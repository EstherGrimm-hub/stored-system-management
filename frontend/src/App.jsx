import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout
import AdminLayout from './layouts/AdminLayout';

// Import các Trang (Pages)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/user/Home';
import POS from './pages/user/POS';
import CreateStore from './pages/user/CreateStore';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Inventory from './pages/admin/Inventory';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetail from './pages/admin/UserDetail';
import StoreDetail from './pages/admin/StoreDetail';
import ImpersonateDashboard from './pages/admin/ImpersonateDashboard';
import Categories from './pages/admin/Categories';
import Import from './pages/admin/Import';

// Một component nhỏ để bảo vệ Route, nếu chưa có Token thì đá ra trang Login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Component để bảo vệ Route dành cho Admin (Super Admin)
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Component để bảo vệ Route dành cho User (Store Owner)
const UserRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/super-dashboard" replace />;
  }

  const hasStore = !!user?.storeId || user?.hasStore;
  if (!hasStore) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROUTE PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ROUTE THU NGÂN - CHỈ DÀNH CHO STORE OWNER (User Role) */}
        <Route 
          path="/pos" 
          element={
            <UserRoute>
              <POS />
            </UserRoute>
          } 
        />
        <Route
          path="/create-store"
          element={
            <ProtectedRoute>
              <CreateStore />
            </ProtectedRoute>
          }
        />

        {/* ROUTE QUẢN LÝ STORE - DÀNH CHO STORE OWNER (User Role) */}
        <Route 
          path="/admin" 
          element={
            <UserRoute>
              <AdminLayout />
            </UserRoute>
          }
        >
          {/* Mặc định vào /admin sẽ chuyển hướng sang dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="import" element={<Import />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        {/* ROUTE SUPER ADMIN DASHBOARD - CHỈ DÀNH CHO ADMIN (Admin Role) */}
        <Route 
          path="/admin/super-dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />

        {/* ROUTE QUẢN LÝ USER - CHỈ DÀNH CHO ADMIN (Admin Role) */}
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } 
        />

        {/* ROUTE CHI TIẾT USER - CHỈ DÀNH CHO ADMIN */}
        <Route 
          path="/admin/user-detail/:id" 
          element={
            <AdminRoute>
              <UserDetail />
            </AdminRoute>
          } 
        />

        {/* ROUTE CHI TIẾT STORE - CHỈ DÀNH CHO ADMIN */}
        <Route 
          path="/admin/store-detail/:id" 
          element={
            <AdminRoute>
              <StoreDetail />
            </AdminRoute>
          } 
        />

        {/* ROUTE IMPLICITATION STORE USER - CHỈ DÀNH CHO ADMIN */}
        <Route
          path="/admin/super-dashboard/impersonate/:userId"
          element={
            <AdminRoute>
              <ImpersonateDashboard />
            </AdminRoute>
          }
        />

        {/* Bắt các route không tồn tại (404) */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;