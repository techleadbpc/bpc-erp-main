import React from "react";
import { TransferProvider } from "./contexts/TransferContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import RequestForm from "./pages/RequestForm";
import RequestDetails from "./pages/RequestDetails";
import ApprovalPage from "./pages/ApprovalPage";
import TransferStatus from "./pages/TransferStatus";
import { Route, Routes } from "react-router";

function Page() {
  return (
    <TransferProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/request" element={<RequestForm />} />
            <Route path="/request/:id" element={<RequestDetails />} />
            <Route path="/approvals" element={<ApprovalPage />} />
            <Route path="/status/:id" element={<TransferStatus />} />
          </Routes>
        </main>
      </div>
    </TransferProvider>
  );
}

export default Page;
