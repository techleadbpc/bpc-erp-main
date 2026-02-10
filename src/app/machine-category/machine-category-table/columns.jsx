import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import api from "@/services/api/api-service";
import { toast } from "@/hooks/use-toast";
import { UpdateMachineCategory } from "@/components/add-primary-category-form";
import { useLoader } from "@/common/context/loader/loader-provider";
import { useDispatch, useSelector } from "react-redux";
import { fetchMachineCategories } from "@/features/machine-category/machine-category-slice";
import { useNavigate } from "react-router";
import { ROLES } from "@/utils/roles";

export const columns = [
  // {
  //   accessorKey: "id",
  //   header: "ID",
  //   className: "min-w-[60px] max-w-[60px] text-center",
  // },
  {
    accessorKey: "name",
    header: "Machine Category",
  },
  {
    accessorKey: "primaryCategory.name",
    header: "Primary Category",
  },
  {
    accessorKey: "averageBase",
    header: "Average Base",
  },
  {
    accessorKey: "standardHrsRun",
    header: "Standard Hrs Run",
  },
  {
    accessorKey: "useFor",
    header: "Usage",
  },
  {
    accessorKey: "machineType",
    header: "Machine Type",
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
  },
  // {
  //   accessorKey: "createdAt",
  //   header: "Created At",
  //   cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  // },
  // {
  //   accessorKey: "updatedAt",
  //   header: "Updated At",
  //   cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
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
      const navigate = useNavigate();
      const { showLoader, hideLoader } = useLoader();
      const handleDelete = async (id) => {
        try {
          showLoader();
          await api.delete(`/category/machine/${id}`);
          toast({
            title: "Success",
            description: "Category deleted successfully.",
          });
          dispatch(fetchMachineCategories());
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete category.",
          });
        } finally {
          hideLoader();
        }
      };
      const handleEdit = () => {
        navigate("/machine-category/update", {
          state: { myData: row.original },
        });
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
            <DropdownMenuItem
              className={`${NotAllowed && "hidden"}`}
              onClick={() => handleEdit()}
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
