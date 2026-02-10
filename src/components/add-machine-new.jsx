import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { FormMessage } from "./ui/form";
import SelectDropdown from "./ui/select-dropdown";
import { useNavigate } from "react-router";
import { fetchMachines } from "@/features/machine/machine-slice";

// Define field configurations for different machine categories
const categoryFieldConfigurations = {
  // Default configuration - all fields are required
  default: {
    // Step 1 Fields
    primaryCategoryId: { required: true },
    machineCategoryId: { required: true },
    machineName: { required: true },
    registrationNumber: { required: false },
    machineNumber: { required: true },
    machineCode: { required: false },
    erpCode: { required: false },
    siteId: { required: false },

    // Step 2 Fields
    chassisNumber: { required: true },
    engineNumber: { required: false },
    serialNumber: { required: false },
    model: { required: false },
    make: { required: false },
    purchaseDate: { required: false },
    yom: { required: false },
    capacity: { required: false },

    // Step 3 Fields
    fitnessCertificateExpiry: { required: true, display: true },
    motorVehicleTaxDue: { required: true, display: true },
    permitExpiryDate: { required: true, display: true },
    nationalPermitExpiry: { required: true, display: true },
    insuranceExpiry: { required: true, display: true },
    pollutionCertificateExpiry: { required: true, display: true },
    machineImageFile: { required: false, display: true },

    // Step 4 Fields
    ownerName: { required: true },
    ownerType: { required: true },
  },

  // Example category specific configurations - add more as needed
  // Heavy Machinery (e.g., Excavators)
  1: {
    registrationNumber: { required: true },
    fitnessCertificateExpiry: { required: false, display: false },
    permitExpiryDate: { required: false, display: false },
    nationalPermitExpiry: { required: false, display: false },
  },

  // Transportation Vehicles
  2: {
    // For vehicles that need all certificates
    registrationNumber: { required: true },
    chassisNumber: { required: true },
    engineNumber: { required: true },
  },

  // Small Equipment
  3: {
    // For smaller equipment that doesn't require certificates
    chassisNumber: { required: false },
    registrationNumber: { required: false },
    fitnessCertificateExpiry: { required: false, display: false },
    motorVehicleTaxDue: { required: false, display: false },
    permitExpiryDate: { required: false, display: false },
    nationalPermitExpiry: { required: false, display: false },
    insuranceExpiry: { required: false, display: false },
    pollutionCertificateExpiry: { required: false, display: false },
  },
};

// Function to generate dynamic schema based on category
const generateDynamicSchema = (schema, categoryId, machineCategoryId) => {
  // Use a specific configuration if available, otherwise use default
  const config =
    categoryFieldConfigurations[machineCategoryId] ||
    categoryFieldConfigurations[categoryId] ||
    categoryFieldConfigurations.default;

  const newSchema = { ...schema };

  // Modify schema based on config
  Object.keys(newSchema).forEach((field) => {
    if (config[field] && !config[field].required) {
      // Make the field optional if it's not required for this category
      if (typeof newSchema[field] === "object" && newSchema[field].optional) {
        // Field already has optional method
        // No change needed
      } else if (typeof newSchema[field] === "object") {
        // Field is an object schema, make it optional
        newSchema[field] = newSchema[field].optional();
      }
    }
  });

  return newSchema;
};

const Step1 = ({
  onNext,
  primaryCategories,
  machineCategories,
  siteList,
  watch,
  currentConfig,
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
          <Label htmlFor="machineName">
            Machine Name {currentConfig.machineName?.required ? "*" : ""}
          </Label>
          <Input
            id="machineName"
            {...onNext.register("machineName", {
              required: currentConfig.machineName?.required,
            })}
          />
          {onNext.formState.errors.machineName && (
            <FormMessage>
              {onNext.formState.errors.machineName.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="registrationNumber">
            Registration Number{" "}
            {currentConfig.registrationNumber?.required ? "*" : ""}
          </Label>
          <Input
            id="registrationNumber"
            {...onNext.register("registrationNumber", {
              required: currentConfig.registrationNumber?.required,
            })}
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
          <Label htmlFor="machineNumber">
            Machine Number {currentConfig.machineNumber?.required ? "*" : ""}
          </Label>
          <Input
            id="machineNumber"
            {...onNext.register("machineNumber", {
              required: currentConfig.machineNumber?.required,
            })}
          />
          {onNext.formState.errors.machineNumber && (
            <FormMessage>
              {onNext.formState.errors.machineNumber.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="machineCode">
            Machine Code {currentConfig.machineCode?.required ? "*" : ""}
          </Label>
          <Input
            id="machineCode"
            {...onNext.register("machineCode", {
              required: currentConfig.machineCode?.required,
            })}
          />
          {onNext.formState.errors.machineCode && (
            <FormMessage>
              {onNext.formState.errors.machineCode.message}
            </FormMessage>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="erpCode">
            ERP Code {currentConfig.erpCode?.required ? "*" : ""}
          </Label>
          <Input
            id="erpCode"
            {...onNext.register("erpCode", {
              required: currentConfig.erpCode?.required,
            })}
          />
          {onNext.formState.errors.erpCode && (
            <FormMessage>{onNext.formState.errors.erpCode.message}</FormMessage>
          )}
        </div>
        <div className="col-span-6">
          <SelectDropdown
            label={`Allocate Site ${currentConfig.siteId?.required ? "*" : ""}`}
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

const Step2 = ({ onNext, currentConfig }) => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="chassisNumber">
            Chassis Number {currentConfig.chassisNumber?.required ? "*" : ""}
          </Label>
          <Input
            id="chassisNumber"
            {...onNext.register("chassisNumber", {
              required: currentConfig.chassisNumber?.required,
            })}
          />
          {onNext.formState.errors.chassisNumber && (
            <FormMessage>
              {onNext.formState.errors.chassisNumber.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="engineNumber">
            Engine Number {currentConfig.engineNumber?.required ? "*" : ""}
          </Label>
          <Input
            id="engineNumber"
            {...onNext.register("engineNumber", {
              required: currentConfig.engineNumber?.required,
            })}
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
          <Label htmlFor="serialNumber">
            Serial Number {currentConfig.serialNumber?.required ? "*" : ""}
          </Label>
          <Input
            id="serialNumber"
            {...onNext.register("serialNumber", {
              required: currentConfig.serialNumber?.required,
            })}
          />
          {onNext.formState.errors.serialNumber && (
            <FormMessage>
              {onNext.formState.errors.serialNumber.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="model">
            Model {currentConfig.model?.required ? "*" : ""}
          </Label>
          <Input
            id="model"
            {...onNext.register("model", {
              required: currentConfig.model?.required,
            })}
          />
          {onNext.formState.errors.model && (
            <FormMessage>{onNext.formState.errors.model.message}</FormMessage>
          )}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="make">
            Make {currentConfig.make?.required ? "*" : ""}
          </Label>
          <Input
            id="make"
            {...onNext.register("make", {
              required: currentConfig.make?.required,
            })}
          />
          {onNext.formState.errors.make && (
            <FormMessage>{onNext.formState.errors.make.message}</FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="purchaseDate">
            Purchase Date {currentConfig.purchaseDate?.required ? "*" : ""}
          </Label>
          <Input
            id="purchaseDate"
            type="date"
            {...onNext.register("purchaseDate", {
              required: currentConfig.purchaseDate?.required,
            })}
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
          <Label htmlFor="yom">
            Year of Manufacture {currentConfig.yom?.required ? "*" : ""}
          </Label>
          <Input
            id="yom"
            type="number"
            {...onNext.register("yom", {
              required: currentConfig.yom?.required,
            })}
          />
          {onNext.formState.errors.yom && (
            <FormMessage>{onNext.formState.errors.yom.message}</FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <Label htmlFor="capacity">
            Capacity {currentConfig.capacity?.required ? "*" : ""}
          </Label>
          <Input
            id="capacity"
            {...onNext.register("capacity", {
              required: currentConfig.capacity?.required,
            })}
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

const Step3 = ({ onNext, currentConfig }) => {
  return (
    <>
      {/* Only render fields if they should be displayed for this category */}
      {currentConfig.fitnessCertificateExpiry?.display !== false && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Label htmlFor="fitnessCertificateExpiry">
              Fitness Certificate Expiry{" "}
              {currentConfig.fitnessCertificateExpiry?.required ? "*" : ""}
            </Label>
            <Input
              id="fitnessCertificateExpiry"
              type="date"
              {...onNext.register("fitnessCertificateExpiry", {
                required: currentConfig.fitnessCertificateExpiry?.required,
              })}
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
          {currentConfig.motorVehicleTaxDue?.display !== false && (
            <div className="col-span-6">
              <Label htmlFor="motorVehicleTaxDue">
                Motor Vehicle Tax Due{" "}
                {currentConfig.motorVehicleTaxDue?.required ? "*" : ""}
              </Label>
              <Input
                id="motorVehicleTaxDue"
                type="date"
                {...onNext.register("motorVehicleTaxDue", {
                  required: currentConfig.motorVehicleTaxDue?.required,
                })}
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
          )}
        </div>
      )}

      {currentConfig.permitExpiryDate?.display !== false &&
        currentConfig.nationalPermitExpiry?.display !== false && (
          <div className="grid grid-cols-12 gap-4">
            {currentConfig.permitExpiryDate?.display !== false && (
              <div className="col-span-6">
                <Label htmlFor="permitExpiryDate">
                  Permit Expiry Date{" "}
                  {currentConfig.permitExpiryDate?.required ? "*" : ""}
                </Label>
                <Input
                  id="permitExpiryDate"
                  type="date"
                  {...onNext.register("permitExpiryDate", {
                    required: currentConfig.permitExpiryDate?.required,
                  })}
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
            )}

            {currentConfig.nationalPermitExpiry?.display !== false && (
              <div className="col-span-6">
                <Label htmlFor="nationalPermitExpiry">
                  National Permit Expiry{" "}
                  {currentConfig.nationalPermitExpiry?.required ? "*" : ""}
                </Label>
                <Input
                  id="nationalPermitExpiry"
                  type="date"
                  {...onNext.register("nationalPermitExpiry", {
                    required: currentConfig.nationalPermitExpiry?.required,
                  })}
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
            )}
          </div>
        )}

      {currentConfig.insuranceExpiry?.display !== false &&
        currentConfig.pollutionCertificateExpiry?.display !== false && (
          <div className="grid grid-cols-12 gap-4">
            {currentConfig.insuranceExpiry?.display !== false && (
              <div className="col-span-6">
                <Label htmlFor="insuranceExpiry">
                  Insurance Expiry{" "}
                  {currentConfig.insuranceExpiry?.required ? "*" : ""}
                </Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  {...onNext.register("insuranceExpiry", {
                    required: currentConfig.insuranceExpiry?.required,
                  })}
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
            )}

            {currentConfig.pollutionCertificateExpiry?.display !== false && (
              <div className="col-span-6">
                <Label htmlFor="pollutionCertificateExpiry">
                  Pollution Certificate Expiry{" "}
                  {currentConfig.pollutionCertificateExpiry?.required
                    ? "*"
                    : ""}
                </Label>
                <Input
                  id="pollutionCertificateExpiry"
                  type="date"
                  {...onNext.register("pollutionCertificateExpiry", {
                    required:
                      currentConfig.pollutionCertificateExpiry?.required,
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
            )}
          </div>
        )}

      {currentConfig.machineImageFile?.display !== false && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Label htmlFor="machineImageFile">
              Machine Image{" "}
              {currentConfig.machineImageFile?.required ? "*" : ""}
            </Label>
            <Input
              id="machineImageFile"
              type="file"
              {...onNext.register("machineImageFile", {
                required: currentConfig.machineImageFile?.required,
              })}
            />
            {onNext.formState.errors.machineImageFile && (
              <FormMessage>
                {onNext.formState.errors.machineImageFile.message}
              </FormMessage>
            )}
          </div>
        </div>
      )}

      {/* Display a message if no fields are shown in this step */}
      {!currentConfig.fitnessCertificateExpiry?.display &&
        !currentConfig.motorVehicleTaxDue?.display &&
        !currentConfig.permitExpiryDate?.display &&
        !currentConfig.nationalPermitExpiry?.display &&
        !currentConfig.insuranceExpiry?.display &&
        !currentConfig.pollutionCertificateExpiry?.display &&
        !currentConfig.machineImageFile?.display && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No document uploads required for this machine category.
            </p>
          </div>
        )}
    </>
  );
};

const Step4 = ({ onNext, currentConfig }) => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="ownerName">
            Owner Name {currentConfig.ownerName?.required ? "*" : ""}
          </Label>
          <Input
            id="ownerName"
            {...onNext.register("ownerName", {
              required: currentConfig.ownerName?.required,
            })}
          />
          {onNext.formState.errors.ownerName && (
            <FormMessage>
              {onNext.formState.errors.ownerName.message}
            </FormMessage>
          )}
        </div>

        <div className="col-span-6">
          <SelectDropdown
            label={`Owner Type ${currentConfig.ownerType?.required ? "*" : ""}`}
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
    </>
  );
};

const AddMachineMultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fieldConfig, setFieldConfig] = useState(
    categoryFieldConfigurations.default
  );

  const { data: primaryCategories } =
    useSelector((state) => state.primaryCategories) || [];

  const { data: machineCategories } =
    useSelector((state) => state.machineCategories) || [];

  const { data: siteList } = useSelector((state) => state.sites) || [];

  const { toast } = useToast();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  // Base schema definitions - will be modified dynamically
  const baseSchemas = {
    step1: {
      primaryCategoryId: { required: true },
      machineCategoryId: { required: true },
      machineName: { required: true },
      registrationNumber: { required: false },
      machineNumber: { required: true },
      machineCode: { required: false },
      erpCode: { required: false },
      siteId: { required: false },
    },
    step2: {
      chassisNumber: { required: true },
      engineNumber: { required: false },
      serialNumber: { required: false },
      model: { required: false },
      make: { required: false },
      purchaseDate: { required: false },
      yom: { required: false },
      capacity: { required: false },
    },
    step3: {
      fitnessCertificateExpiry: { required: true, display: true },
      motorVehicleTaxDue: { required: true, display: true },
      permitExpiryDate: { required: true, display: true },
      nationalPermitExpiry: { required: true, display: true },
      insuranceExpiry: { required: true, display: true },
      pollutionCertificateExpiry: { required: true, display: true },
      machineImageFile: { required: false, display: true },
    },
    step4: {
      ownerName: { required: true },
      ownerType: { required: true },
    },
  };

  const methods = useForm({
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
    trigger,
    reset,
  } = methods;

  // Watch for changes in category selection
  const primaryCategoryId = watch("primaryCategoryId");
  const machineCategoryId = watch("machineCategoryId");

  // Update field configuration when category changes
  useEffect(() => {
    if (machineCategoryId) {
      // Get specific configuration for this machine category
      const newConfig =
        categoryFieldConfigurations[machineCategoryId] ||
        categoryFieldConfigurations[primaryCategoryId] ||
        categoryFieldConfigurations.default;

      setFieldConfig(newConfig);

      // Reset validation for affected fields
      trigger();
    }
  }, [primaryCategoryId, machineCategoryId, trigger]);

  const navigateToStep = (stepNumber) => {
    // Validate current step before navigation
    trigger().then((isValid) => {
      if (isValid || stepNumber < step) {
        setStep(stepNumber);
      }
    });
  };

  const handleNext = async (data) => {
    // Validate current step
    const isValid = await trigger();

    if (isValid) {
      // Save the current step data
      Object.keys(data).forEach((key) => setValue(key, data[key]));

      setStep((prevStep) => {
        const nextStep = prevStep + 1;
        return nextStep;
      });
    }
  };

  const handleFinalSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();

    // Loop through the form data and append to formData
    Object.entries(data).forEach(([key, value]) => {
      // Skip null or undefined values
      if (value === null || value === undefined) return;

      if (value instanceof FileList) {
        // Only append files if any are selected
        if (value.length > 0) {
          Array.from(value).forEach((file) => formData.append(key, file));
        }
      } else if (value !== "") {
        formData.append(key, value);
      }
    });

    try {
      const res = await api.post("/machinery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast({
        title: "Success! ",
        description: "Machine created successfully",
      });
      dispatch(fetchMachines());
      navigate("/list-machine");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error.response?.data?.message || "Failed to submit the form.",
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
                e.preventDefault(); // Prevent default form submission
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
                currentConfig={fieldConfig}
              />

              <div className="flex justify-between mt-4">
                {step > 1 && (
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
    <aside className="bg-accent mb-2 rounded p-4">
      <ul className="flex gap-4">
        {steps.map((step, index) => (
          <li key={index}>
            <Button
              variant={currentStep === index + 1 ? "default" : "outline"}
              onClick={() => navigateToStep(index + 1)}
              className="w-full text-xs"
            >
              {step}
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default AddMachineMultiStepForm;
