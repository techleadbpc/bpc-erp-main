import { LoginForm } from "@/components/login-form"
import wallImageRew from "@/assets/images/login-bg-rewamped.webp"
import companyLogo from "@/assets/icons/company-logo.jpeg"
import { getCompanyInfo } from "@/config/brand-config";

export default function LoginPage() {
  const companyInfo = getCompanyInfo();
  return (
    (<div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-end gap-2 font-medium">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <img
                src={companyLogo}
                alt="Image"
                className="object-contain dark:brightness-[0.2] dark:grayscale" />
            </div>
            {companyInfo.name.replace("M/s ", "")} {/* Remove "M/s " prefix for cleaner display */}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={wallImageRew}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
      </div>
    </div>)
  );
}
