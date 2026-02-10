import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Routes, Route, Navigate } from "react-router";
import AuthRouter from "./router/auth-router";
import AppRouter from "./router/app-router";
import { useSelector, useDispatch } from "react-redux";
import { BrandProvider } from "./contexts/BrandContext";

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return (
    <BrandProvider>
      <Routes>
        {isAuthenticated ? (
          <Route path="/*" element={<AppRouter />} />
        ) : (
          <Route path="/*" element={<AuthRouter />} />
        )}
      </Routes>
      <Toaster />
    </BrandProvider>
  );
}

export default App;
