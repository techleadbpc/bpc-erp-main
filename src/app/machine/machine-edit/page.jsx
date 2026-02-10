import { Suspense } from "react";
import { MachineEditForm } from "./machine-edit-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "react-router";

export default function MachineEditPage() {
  const params = useParams();
  const machineId = params.id;
  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Edit Machine</h1>
        <p className="text-muted-foreground">
          Update machine details and save changes
        </p>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <MachineEditForm machineId={machineId} />
      </Suspense>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
