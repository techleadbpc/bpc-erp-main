import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MachineServiceIntervalsList from "./components/MachineServiceIntervalsList";
import MachineServiceIntervalForm from "./components/MachineServiceIntervalForm";
import { maintenanceIntervalsService } from "@/services/api/maintenance-intervals-service";
import MachineServiceIntervalFormV2 from "./components/MachineServiceIntervalFormV2";

const MachineServiceIntervalsManager = ({ machineId }) => {
  const [intervals, setIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(null);
  const [formData, setFormData] = useState({
    serviceType: "",
    intervalHours: "",
    intervalKm: "",
    intervalCalendarDays: "",
    notes: "",
    isActive: true,
  });

  // Fetch service intervals for the machine
  const fetchIntervals = async () => {
    try {
      setLoading(true);
      const data = await maintenanceIntervalsService.getMachineServiceIntervals(
        machineId
      );
      setIntervals(data);
    } catch (error) {
      console.error("Error fetching service intervals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load intervals when component mounts or machineId changes
  useEffect(() => {
    if (machineId) {
      fetchIntervals();
    }
  }, [machineId]);

  // Handle form input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form select changes
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentInterval) {
        // Update existing interval
        await maintenanceIntervalsService.updateServiceInterval(
          currentInterval.id,
          {
            ...formData,
            machineId,
          }
        );
      } else {
        // Create new interval
        await maintenanceIntervalsService.createServiceInterval({
          ...formData,
          machineId,
        });
      }

      // Refresh the list
      fetchIntervals();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Error saving service interval:", error);
    }
  };

  // Handle adding a new interval
  const handleAddNew = () => {
    resetForm();
    setCurrentInterval(null);
    setShowForm(true);
  };

  // Handle editing an interval
  const handleEdit = (interval) => {
    setFormData({
      serviceType: interval.serviceType,
      intervalHours: interval.intervalHours || "",
      intervalKm: interval.intervalKm || "",
      intervalCalendarDays: interval.intervalCalendarDays || "",
      notes: interval.notes || "",
    });
    setCurrentInterval(interval);
    setShowForm(true);
  };

  // Handle deleting an interval
  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this service interval?")
    ) {
      try {
        await maintenanceIntervalsService.deleteServiceInterval(id);
        fetchIntervals(); // Refresh the list
      } catch (error) {
        console.error("Error deleting service interval:", error);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      serviceType: "",
      intervalHours: "",
      intervalKm: "",
      intervalCalendarDays: "",
      notes: "",
    });
    setCurrentInterval(null);
  };

  // Handle form cancel
  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Intervals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading service intervals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Machine Service Intervals</CardTitle>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <MachineServiceIntervalFormV2
            machineId={machineId}
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <MachineServiceIntervalsList
            intervals={intervals}
            onEdit={handleEdit}
            onDelete={handleDelete}
            machineId={machineId}
            onAddNew={handleAddNew}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MachineServiceIntervalsManager;
