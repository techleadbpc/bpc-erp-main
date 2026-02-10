import Loader, { Spinner } from "@/components/ui/loader";
import { useSelector } from "react-redux";
import { columns } from "./columns";
import { AddSiteDialog, DataTable } from "./data-table";

export default function SiteTable() {
  const { data, loading } = useSelector((state) => state.sites);
  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
        <AddSiteDialog />
      </div>
      <div className="container mx-auto py-2 min-h-screen flex flex-col">
        <DataTable columns={columns} data={data} loading={loading} />
      </div>
    </>
  );
}
