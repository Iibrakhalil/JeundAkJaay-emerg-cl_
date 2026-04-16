import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ServicesPage from "./pages/ServicesPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import PostProductPage from "./pages/PostProductPage";
import PostServicePage from "./pages/PostServicePage";
import TransactionsPage from "./pages/TransactionsPage";
import AdminDashboard from "./pages/AdminDashboard";
import EditProductPage from "./pages/EditProductPage";
import EditServicePage from "./pages/EditServicePage";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="p-8 text-center text-orange-600">Chargement...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="p-8 text-center text-orange-600">Chargement...</div>;

  if (!isAuthenticated || !user?.isAdmin) {
    console.log("Admin check failed:", { isAuthenticated, isAdmin: user?.isAdmin });
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppContent() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:id" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/post-product" 
            element={
              <ProtectedRoute>
                <PostProductPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/post-service" 
            element={
              <ProtectedRoute>
                <PostServicePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-product/:id" 
            element={
              <ProtectedRoute>
                <EditProductPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-service/:id" 
            element={
              <ProtectedRoute>
                <EditServicePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
