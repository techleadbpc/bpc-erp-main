import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import { PlusCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { ROLES } from "@/utils/roles";
import { fetchMachines } from "@/features/machine/machine-slice";
import { useEffect } from "react";

export default function MachineTable() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.machines);

  useEffect(() => {
    if (data.length > 0) {
      return;
    }
    dispatch(fetchMachines());
  }, [data]);
  const { user } = useSelector((state) => state.auth);
  const userRoleId = user?.roleId;
  const NotAllowed = [
    ROLES.MECHANICAL_STORE_MANAGER.id,
    ROLES.MECHANICAL_INCHARGE.id,
    ROLES.PROJECT_MANAGER.id,
  ].includes(userRoleId);

  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="container mx-auto min-h-screen flex flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Machine</h1>
        <div className={`${NotAllowed && "hidden"}`}>
          <Link to="/machine/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Machine
            </Button>
          </Link>
        </div>
      </div>
      <DataTable columns={columns} data={data} loading={loading} />
    </div>
  );
}
