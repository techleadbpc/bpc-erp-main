import { Info, MoreHorizontal, Trash2 } from "lucide-react";
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
import { UpdateSite } from "@/components/add-site-form";
import api from "@/services/api/api-service";
import { toast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { fetchSites } from "@/features/sites/sites-slice";
import { useLoader } from "@/common/context/loader/loader-provider";
import { useNavigate } from "react-router";

export const columns = [
  // {
  //   accessorKey: "id",
  //   header: "ID",
  //   className: "min-w-[60px] max-w-[60px] text-center",
  // },
  {
    accessorKey: "code",
    header: "Site Code",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={"text-sm flex cursor-pointer"}
        >
          Site name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </span>
      );
    },
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile Number",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "pincode",
    header: "Pincode",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <>{row.original.status.toUpperCase()}</>;
    },
  },
  // {
  //   accessorKey: "createdAt",
  //   header: "Created At",
  //   cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  // },
  {
    id: "actions",
    header: ({ column }) => {
      return <span className={"text-sm flex cursor-pointer"}>Action</span>;
    },
    cell: ({ row }) => {
      const dispatch = useDispatch();
      const navigate = useNavigate();
      const { showLoader, hideLoader } = useLoader();
      const handleDelete = async (id) => {
        const sid = Number(id);
        try {
          showLoader();
          await api.delete(`/sites/${sid}`);
          toast({
            title: "Success",
            description: "Site deleted successfully.",
          });
          dispatch(fetchSites());
          // Trigger a re-fetch or update local state here if needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              error.response?.data?.message || "Failed to delete the site.",
          });
        } finally {
          hideLoader();
        }
      };
      return (
        <DropdownMenu modal={false}>
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
              onSelect={(e) => {
                e.preventDefault();
                navigate(`/sites/${row.original.id}`);
              }}
            >
              <Info className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <UpdateSite data={row.original} />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
              className={"text-red-500"}
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
