import { FileImage, Info, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { UpdateMachine } from "@/components/update-machine-form"; // Assume this component exists
import api from "@/services/api/api-service";
import { toast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "@/common/context/loader/loader-provider";
import { fetchMachines } from "@/features/machine/machine-slice";
import { useNavigate } from "react-router";
import { ROLES } from "@/utils/roles";
// import { UpdateMachine } from "@/components/add-machine-form";

export const columns = [
  // {
  //   accessorKey: "id",
  //   header: "ID",
  //   className: "min-w-[60px] max-w-[60px] text-center",
  // },
  { accessorKey: "erpCode", header: "ERP Code" },
  { accessorKey: "machineName", header: "Machine Name" },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "site",
    header: "Site Location",
    cell: ({ row }) => {
      return <>{row.original.site?.name}</>;
    },
  },
  { accessorKey: "machineCode", header: "Machine Code" },
  { accessorKey: "machineNumber", header: "Machine Number" },
  { accessorKey: "registrationNumber", header: "Registration Number" },
  { accessorKey: "chassisNumber", header: "Chassis Number" },
  { accessorKey: "engineNumber", header: "Engine Number" },
  { accessorKey: "serialNumber", header: "Serial Number" },
  { accessorKey: "model", header: "Model" },
  // { accessorKey: "make", header: "Make" },
  // { accessorKey: "yom", header: "Year of Manufacture" },
  // {
  //   accessorKey: "fitnessCertificateExpiry",
  //   header: "Fitness Expiry",
  //   cell: ({ row }) =>
  //     row.original.fitnessCertificateExpiry != null
  //       ? new Date(row.original.fitnessCertificateExpiry).toLocaleDateString()
  //       : "NA",
  // },
  // {
  //   accessorKey: "motorVehicleTaxDue",
  //   header: "MV Tax Due",
  //   cell: ({ row }) =>
  //     row.original.motorVehicleTaxDue != null
  //       ? new Date(row.original.motorVehicleTaxDue).toLocaleDateString()
  //       : "NA",
  // },
  // {
  //   accessorKey: "permitExpiryDate",
  //   header: "Permit Expiry",
  //   cell: ({ row }) =>
  //     row.original.permitExpiryDate != null
  //       ? new Date(row.original.permitExpiryDate).toLocaleDateString()
  //       : "NA",
  // },
  // {
  //   accessorKey: "nationalPermitExpiry",
  //   header: "National Permit Expiry",
  //   cell: ({ row }) =>
  //     row.original.nationalPermitExpiry != null
  //       ? new Date(row.original.nationalPermitExpiry).toLocaleDateString()
  //       : "NA",
  // },
  // {
  //   accessorKey: "insuranceExpiry",
  //   header: "Insurance Expiry",
  //   cell: ({ row }) =>
  //     row.original.insuranceExpiry != null
  //       ? new Date(row.original.insuranceExpiry).toLocaleDateString()
  //       : "NA",
  // },
  // {
  //   accessorKey: "pollutionCertificateExpiry",
  //   header: "Pollution Expiry",
  //   cell: ({ row }) =>
  //     row.original.pollutionCertificateExpiry != null
  //       ? new Date(row.original.pollutionCertificateExpiry).toLocaleDateString()
  //       : "NA",
  // },
  // {
  //   accessorKey: "isActive",
  //   header: "Active Status",
  //   cell: ({ row }) => (row.original.isActive ? "Active" : "Inactive"),
  // },

  {
    id: "actions",
    header: "Actions",
    className: "sticky-col",
    cell: ({ row }) => {
      const { user } = useSelector((state) => state.auth);
      const userRoleId = user?.roleId;
      const NotAllowed = [
        ROLES.MECHANICAL_STORE_MANAGER.id,
        ROLES.MECHANICAL_INCHARGE.id,
        ROLES.PROJECT_MANAGER.id,
      ].includes(userRoleId);
      const dispatch = useDispatch();
      const { showLoader, hideLoader } = useLoader();
      const navigate = useNavigate();

      const handleDelete = async (id) => {
        const machineId = Number(id);
        try {
          showLoader();
          await api.delete(`/machinery/${machineId}`);
          toast({
            title: "Success",
            description: "Machine deleted successfully.",
          });
          dispatch(fetchMachines());
          // Trigger a re-fetch or update local state here if needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              error.response?.data?.message || "Failed to delete the machine.",
          });
        } finally {
          hideLoader();
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem onClick={(e) => e.preventDefault()}> */}
            {/* <UpdateMachine data={row.original} /> */}
            {/* Edit */}
            {/* </DropdownMenuItem> */}
            <DropdownMenuItem
              onClick={() => navigate(`/machine/${row.original.id}`)}
            >
              <Info className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`${NotAllowed && "hidden"}`}
              onClick={() => navigate(`/machine/edit/${row.original.id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
              className={"text-red-500 " + `${NotAllowed && "hidden"}`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
