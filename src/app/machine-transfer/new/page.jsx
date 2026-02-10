import { TransferForm } from "@/components/machine-transfer/transfer-form";

export default function NewTransferPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          New Machine Transfer
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a new machine transfer request
        </p>
      </div>
      <TransferForm />
    </div>
  );
}
