import React from "react";
import { Routes, Route } from "react-router";
import LoginPage from "@/app/login/page";

function AuthRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
}

export default AuthRouter;
