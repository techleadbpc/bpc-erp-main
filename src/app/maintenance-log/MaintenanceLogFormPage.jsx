import { Button } from "@/components/ui/button";
import { ArrowLeft, CloudCog } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "@/services/api/api-service";
import MaintenanceLogForm from "./components/MaintenanceLogForm";

const MaintenanceLogFormPage = () => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    type: "repair",
    date: new Date(),
    title: "",
    description: "",
    cost: "",
    technician: "",
    status: "completed",
    hoursAtService: "",
    dueDate: new Date(),
    estimatedHours: "",
    estimatedCost: "",
    priority: "medium",
    assignedTo: "",
    lastAlertDate: null,
  });

  const { id: machineId } = useParams();
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: date || new Date(),
    }));
  };

  const handleVendorsChange = (newVendors) => {
    setVendors(newVendors);
  };

  const createMaintenanceLog = async (data) => {
    const res = await api.post("/maintanance/logs", data);
    return res.data;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Helper to convert empty strings/null to null, and strings to numbers
    const toNullableNumber = (val) => {
      if (val === "" || val === null || val === undefined) return null;
      return Number(val);
    };

    // Prepare the data with vendor information and correct types
    const maintenanceData = {
      machineId: Number(machineId),
      ...formData,
      hoursAtService: toNullableNumber(formData.hoursAtService),
      kilometersAtService: toNullableNumber(formData.kilometersAtService),
      cost: toNullableNumber(formData.cost),
      estimatedHours: toNullableNumber(formData.estimatedHours),
      estimatedCost: toNullableNumber(formData.estimatedCost),
      vendorAndPartsDetails: vendors,
    };

    createMaintenanceLog(maintenanceData)
      .then((res) => {
        // Navigate back to the maintenance logs page after successful submission
        navigate(`/machine/${machineId}/logs`, {
          state: { machineName: res.machineName || `Machine ${machineId}` },
        });
      })
      .catch((error) => {
        console.error("Error creating Servicing log:", error);
      });
  };

  const handleCancel = () => {
    // Navigate back to the maintenance logs page
    navigate(`/machine/${machineId}/logs`);
  };

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/machine/${machineId}/logs`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Servicing Logs
          </Button>
          <h1 className="text-2xl font-bold">Add New Servicing Record</h1>
        </div>
      </div>

      <MaintenanceLogForm
        formData={formData}
        vendors={vendors}
        onInputChange={(name, value) => handleInputChange(name, value)}
        onSelectChange={handleSelectChange}
        onDateChange={handleDateChange}
        onVendorsChange={handleVendorsChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        machineId={machineId}
      />
    </div>
  );
};

export default MaintenanceLogFormPage;
