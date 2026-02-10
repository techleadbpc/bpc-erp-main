import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { FormMessage } from "./ui/form";
import SelectDropdown from "./ui/select-dropdown";
import { Link, useNavigate } from "react-router";
import { fetchMachines } from "@/features/machine/machine-slice";
import {
  ArrowLeft,
  Backpack,
  PlusCircle,
  ReceiptRussianRuble,
} from "lucide-react";

const Step1 = ({
  onNext,
  primaryCategories,
  machineCategories,
  siteList,
  watch,
}) => {
  const [machineCat, setMachineCat] = useState([]);
  let pcid = watch("primaryCategoryId");

  useEffect(() => {
    const machineCategory = primaryCategories.find((item) => item.id == pcid);
    if (machineCategory) setMachineCat(machineCategory.machineCategories);
  }, [pcid]);

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <SelectDropdown
            label={"Primary Category *"}
            name={"primaryCategoryId"}
            data={primaryCategories}
            control={onNext.control}
          />
          {onNext.formState.errors.primaryCategoryId && (
            <FormMessage>Please select a valid primary category</FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <SelectDropdown
            label={"Machine Category *"}
            name={"machineCategoryId"}
            data={machineCat}
            control={onNext.control}
          />
          {onNext.formState.errors.machineCategoryId && (
            <FormMessage>Please select a valid machine category</FormMessage>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="machineName">Machine Name *</Label>
          <Input
            id="machineName"
            {...onNext.register("machineName", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.machineName && (
            <FormMessage>
              {onNext.formState.errors.machineName.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            {...onNext.register("registrationNumber", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.registrationNumber && (
            <FormMessage>
              {onNext.formState.errors.registrationNumber.message}
            </FormMessage>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="machineNumber">Machine Number</Label>
          <Input
            id="machineNumber"
            {...onNext.register("machineNumber", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.machineNumber && (
            <FormMessage>
              {onNext.formState.errors.machineNumber.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="machineCode">Machine Code</Label>
          <Input
            id="machineCode"
            {...onNext.register("machineCode", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.machineCode && (
            <FormMessage>
              {onNext.formState.errors.machineCode.message}
            </FormMessage>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* <div className="col-span-6">
          <Label htmlFor="erpCode">ERP Code</Label>
          <Input
            id="erpCode"
            {...onNext.register("erpCode", { required: true })}
          />
          {onNext.formState.errors.erpCode && (
            <FormMessage>{onNext.formState.errors.erpCode.message}</FormMessage>
          )}
        </div> */}
        <div className="col-span-6">
          <SelectDropdown
            label={"Allocate Site *"}
            name={"siteId"}
            data={siteList}
            control={onNext.control}
          />
          {onNext.formState.errors.siteId && (
            <FormMessage>Please select a valid site</FormMessage>
          )}
        </div>
      </div>
    </>
  );
};

const Step2 = ({ onNext }) => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="chassisNumber">Chassis Number</Label>
          <Input
            id="chassisNumber"
            {...onNext.register("chassisNumber", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.chassisNumber && (
            <FormMessage>
              {onNext.formState.errors.chassisNumber.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="engineNumber">Engine Number</Label>
          <Input
            id="engineNumber"
            {...onNext.register("engineNumber", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.engineNumber && (
            <FormMessage>
              {onNext.formState.errors.engineNumber.message}
            </FormMessage>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            {...onNext.register("serialNumber", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.serialNumber && (
            <FormMessage>
              {onNext.formState.errors.serialNumber.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            {...onNext.register("model", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.model && (
            <FormMessage>{onNext.formState.errors.model.message}</FormMessage>
          )}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            {...onNext.register("make", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.make && (
            <FormMessage>{onNext.formState.errors.make.message}</FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input
            id="purchaseDate"
            type="date"
            {...onNext.register("purchaseDate", { required: true })}
          />
          {onNext.formState.errors.purchaseDate && (
            <FormMessage>
              {onNext.formState.errors.purchaseDate.message}
            </FormMessage>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="yom">Year of Manufacture</Label>
          <Input
            id="yom"
            type="number"
            {...onNext.register("yom", { required: true })}
          />
          {onNext.formState.errors.yom && (
            <FormMessage>{onNext.formState.errors.yom.message}</FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            {...onNext.register("capacity", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.capacity && (
            <FormMessage>
              {onNext.formState.errors.capacity.message}
            </FormMessage>
          )}
        </div>
      </div>
    </>
  );
};

const Step3 = ({ onNext }) => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="fitnessCertificateExpiry">
            Fitness Certificate Expiry
          </Label>
          <Input
            id="fitnessCertificateExpiry"
            type="date"
            {...onNext.register("fitnessCertificateExpiry", { required: true })}
          />
          <Input
            id="fitnessCertificateFile"
            type="file"
            {...onNext.register("fitnessCertificateFile")}
          />
          {onNext.formState.errors.fitnessCertificateExpiry && (
            <FormMessage>
              {onNext.formState.errors.fitnessCertificateExpiry.message}
            </FormMessage>
          )}
        </div>
        <div className="col-span-6">
          <Label htmlFor="motorVehicleTaxDue">Motor Vehicle Tax Due</Label>
          <Input
            id="motorVehicleTaxDue"
            type="date"
            {...onNext.register("motorVehicleTaxDue", { required: true })}
          />
          <Input
            id="motorVehicleTaxFile"
            type="file"
            {...onNext.register("motorVehicleTaxFile")}
          />
          {onNext.formState.errors.motorVehicleTaxDue && (
            <FormMessage>
              {onNext.formState.errors.motorVehicleTaxDue.message}
            </FormMessage>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="permitExpiryDate">Permit Expiry Date</Label>
          <Input
            id="permitExpiryDate"
            type="date"
            {...onNext.register("permitExpiryDate", { required: true })}
          />
          <Input
            id="permitFile"
            type="file"
            {...onNext.register("permitFile")}
          />
          {onNext.formState.errors.permitExpiryDate && (
            <FormMessage>
              {onNext.formState.errors.permitExpiryDate.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="nationalPermitExpiry">National Permit Expiry</Label>
          <Input
            id="nationalPermitExpiry"
            type="date"
            {...onNext.register("nationalPermitExpiry", { required: true })}
          />
          <Input
            id="nationalPermitFile"
            type="file"
            {...onNext.register("nationalPermitFile")}
          />
          {onNext.formState.errors.nationalPermitExpiry && (
            <FormMessage>
              {onNext.formState.errors.nationalPermitExpiry.message}
            </FormMessage>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
          <Input
            id="insuranceExpiry"
            type="date"
            {...onNext.register("insuranceExpiry", { required: true })}
          />
          <Input
            id="insuranceFile"
            type="file"
            {...onNext.register("insuranceFile")}
          />
          {onNext.formState.errors.insuranceExpiry && (
            <FormMessage>
              {onNext.formState.errors.insuranceExpiry.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="pollutionCertificateExpiry">
            Pollution Certificate Expiry
          </Label>
          <Input
            id="pollutionCertificateExpiry"
            type="date"
            {...onNext.register("pollutionCertificateExpiry", {
              required: true,
            })}
          />
          <Input
            id="pollutionCertificateFile"
            type="file"
            {...onNext.register("pollutionCertificateFile")}
          />
          {onNext.formState.errors.pollutionCertificateExpiry && (
            <FormMessage>
              {onNext.formState.errors.pollutionCertificateExpiry.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="machineImageFile">Machine Image</Label>
          <Input
            id="machineImageFile"
            type="file"
            {...onNext.register("machineImageFile")}
          />
        </div>
      </div>
    </>
  );
};

const Step4 = ({ onNext }) => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="ownerName">Owner Name *</Label>
          <Input
            id="ownerName"
            {...onNext.register("ownerName", { required: true })}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
            }}
          />
          {onNext.formState.errors.ownerName && (
            <FormMessage>
              {onNext.formState.errors.ownerName.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <SelectDropdown
            label={"Owner Type *"}
            name={"ownerType"}
            data={[
              { name: "Company", id: "Company" },
              { name: "Individual", id: "Individual" },
            ]}
            control={onNext.control}
          />
          {onNext.formState.errors.ownerType && (
            <FormMessage>
              {onNext.formState.errors.ownerType.message}
            </FormMessage>
          )}
        </div>
      </div>
      {/* <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="ownerPhone">Owner Phone.</Label>
          <Input
            id="ownerPhone"
            {...onNext.register("ownerPhone", { required: true })}
          />
        </div>

        <div className="col-span-6">
          <Label htmlFor="ownerAddress">Owner Address</Label>
          <Input
            id="ownerAddress"
            {...onNext.register("ownerAddress", { required: true })}
          />
        </div>
      </div> */}
    </>
  );
};

const AddMachineMultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { data: primaryCategories } =
    useSelector((state) => state.primaryCategories) || [];

  const { data: machineCategories } =
    useSelector((state) => state.machineCategories) || [];

  const { data: siteList } = useSelector((state) => state.sites) || [];

  const { toast } = useToast();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const schemas = [step1Schema, step2Schema, step4Schema, step3Schema];

  const methods = useForm({
    resolver: zodResolver(schemas[step - 1]),
    defaultValues: {
      isActive: true,
      status: "Idle",
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const navigateToStep = (stepNumber) => {
    setStep(stepNumber);
  };

  const handleNext = (data) => {
    // Save the current step data
    Object.keys(data).forEach((key) => setValue(key, data[key]));

    setStep((prevStep) => {
      const nextStep = prevStep + 1;
      return nextStep;
    });
  };

  const handleFinalSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();

    // Loop through the form data and append to formData
    Object.entries(data).forEach(([key, value]) => {
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        (value instanceof FileList && value.length === 0)
      ) {
        return;
      }

      if (value instanceof FileList) {
        Array.from(value).forEach((file) => {
          formData.append(key, file);
        });
      } else {
        formData.append(key, value);
      }
    });

    try {
      await api.post("/machinery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast({
        title: "Success! ",
        description: "Machine created successfully",
      });
      dispatch(fetchMachines());
      navigate("/machine");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error.response.data.message || "Failed to submit the form.",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    "General Details",
    "Machine Info.",
    "Owner Info.",
    "Documents",
  ];

  const StepComponent = [Step1, Step2, Step4, Step3][step - 1];

  return (
    <div className="flex flex-col">
      <Sidebar
        steps={steps}
        currentStep={step}
        navigateToStep={navigateToStep}
      />
      <div>
        <div className="max-w-4xl py-4">
          <FormProvider {...methods}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(step < 4 ? handleNext : handleFinalSubmit)();
              }}
              className="space-y-4 "
            >
              <StepComponent
                key={step}
                primaryCategories={primaryCategories}
                machineCategories={machineCategories}
                siteList={siteList}
                onNext={methods}
                watch={watch}
              />

              <div className="flex justify-between mt-4">
                {step > 1 ? (
                  <span
                    className={
                      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2 h-9 cursor-pointer"
                    }
                    onClick={() => {
                      setStep((prev) => Math.max(prev - 1, 1));
                    }}
                  >
                    Back
                  </span>
                ) : (
                  <button
                    disabled
                    className={
                      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2 h-9 cursor-pointer"
                    }
                  >
                    Back
                  </button>
                )}
                <Button loading={loading} type="submit">
                  {step < 4 ? "Next" : "Submit"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ steps, currentStep, navigateToStep }) => {
  return (
    <aside className="bg-accent flex justify-between mb-2 rounded p-4">
      <ul className="flex gap-4">
        {steps.map((step, index) => (
          <li key={index}>
            <Button
              variant={currentStep === index + 1 ? "default" : "outline"}
              onClick={() => {
                // navigateToStep(index + 1)
                console.warn("Navigation disabled");
              }}
              className="w-full text-xs cursor-default hover:bg-red"
            >
              {step}
            </Button>
          </li>
        ))}
      </ul>
      <Link to={`/machine`}>
        <Button variant={"outline"}>
          <ArrowLeft className="h-4 w-4" />
          <span className="ml-2">Back to list</span>
        </Button>
      </Link>
    </aside>
  );
};

// Step 1 Validation Schema
const step1Schema = z.object({
  primaryCategoryId: z.number("Required"),
  machineCategoryId: z.number("Required"),
  machineName: z.string().min(3, "Machine Name is required"),
  machineNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  machineCode: z.string().optional(),
  erpCode: z.string().optional(),
  siteId: z.number("Required"),
});

// Step 2 Validation Schema
const step2Schema = z.object({
  chassisNumber: z.string().optional(),
  engineNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  make: z.string().optional(),
  purchaseDate: z.string().optional(),
  yom: z
    .string()
    .min(4, "Year of Manufacture must be a valid year")
    .max(4, "Year of Manufacture must be a valid year")
    .or(z.literal("")),
  capacity: z.string().optional(),
});

// Step 4 Validation Schema - Note it is actually Step 3!!!!!!!
const step4Schema = z.object({
  ownerName: z.string().min(3, "Owner Name is required"),
  ownerType: z.string().min(3, "Owner Type is required"),
  // ownerPhone: z.string().min(10, "Owner Phone number must be at least 10 digits"),
  // ownerAddress: z.string().min(5, "Owner Address must be at least 5 characters"),
});

// Step 3 Validation Schema - Final Step Submission
const step3Schema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step4Schema.shape,

  fitnessCertificateExpiry: z.string().optional(),
  fitnessCertificateFile: z
    .instanceof(FileList, "Fitness Certificate File is required")
    .optional(),
  motorVehicleTaxDue: z.string().optional(),
  motorVehicleTaxFile: z
    .instanceof(FileList, "Motor Vehicle Tax File is required")
    .optional(),
  permitExpiryDate: z.string().optional(),
  permitFile: z.instanceof(FileList, "Permit File is required").optional(),
  nationalPermitExpiry: z.string().optional(),
  nationalPermitFile: z
    .instanceof(FileList, "National Permit File is required")
    .optional(),
  insuranceExpiry: z.string().optional(),
  insuranceFile: z
    .instanceof(FileList, "Insurance File is required")
    .optional(),
  pollutionCertificateExpiry: z.string().optional(),
  pollutionCertificateFile: z
    .instanceof(FileList, "Pollution Certificate File is required")
    .optional(),
  machineImageFile: z
    .instanceof(FileList, "Machine Image File is required")
    .optional(),
});

export default AddMachineMultiStepForm;
