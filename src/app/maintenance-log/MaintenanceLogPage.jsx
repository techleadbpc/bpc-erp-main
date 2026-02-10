import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import MaintenanceLogList from "./MaintenanceLogList";
import MachineServiceIntervalsManager from "./MachineServiceIntervalsManager";

const MaintenanceLogPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  const { id: machineId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const machineName = location.state?.machineName || "Machine";

  useEffect(() => {
    setShowAddForm(false);
  }, []);

  const handleAddNewLog = () => {
    navigate(`/machine/${machineId}/logs/new`);
  };

  return (
    <div className="container ">
      <div className="sm:max-w-[1200px]s">
        <div className="flex justify-between">
          <div>
            <div className="text-3xl flex items-center font-bold gap-2">
              Servicing Log
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              {machineName} (ID: {machineId})
            </div>
          </div>
          <div>
            <div>
              <Button
                className={"border my-2"}
                variant="ghost"
                onClick={() => navigate(`/machine/${machineId}`)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to details
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Service Intervals Manager */}
          <MachineServiceIntervalsManager machineId={machineId} />

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Servicing Records</h3>
            <Button onClick={handleAddNewLog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </div>

          <MaintenanceLogList
            machineId={machineId}
          />
        </div>
      </div>
    </div>
  );
};

export default MaintenanceLogPage;
