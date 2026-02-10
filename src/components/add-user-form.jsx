import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api/api-service";
import { getIdByRole, ROLES } from "@/utils/roles";
import { useSelector } from "react-redux";

// Custom Dropdown Component
const CustomDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  className = "",
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleOptionSelect = (option) => {
    onChange(option.name);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedOption = options.find((option) => option.name === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "flex items-center justify-between min-h-[40px]",
          error && "border-red-500",
          !value && "text-gray-400",
          className
        )}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronsUpDown
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No sites found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100",
                    "flex items-center justify-between",
                    value === option.name && "bg-blue-50 text-blue-600"
                  )}
                >
                  <span>{option.name}</span>
                  {value === option.name && <Check className="w-4 h-4" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AddUserForm({ fetchUsersData, close }) {
  const { toast } = useToast();
  const { data: sites } = useSelector((s) => s.sites);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    code: "  ",
    roleId: "",
    siteId: "",
    password: "",
    confirm_password: "",
  });

  // Error state
  const [errors, setErrors] = useState({});

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[\W_]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    return errors;
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    // Phone validation
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
    }

    // Employee code validation
    // if (!formData.code || formData.code.length < 3) {
    //   newErrors.code = "Employee code must be at least 3 characters long";
    // }

    // Role validation
    if (!formData.roleId) {
      newErrors.roleId = "Please select a designation";
    }

    // Site validation
    if (
      !formData.siteId &&
      ![
        "Admin",
        "Mechanical Head",
        "Mechanical Manager",
      ].includes(formData.roleId)
    ) {
      newErrors.siteId = "Please select a site";
    }

    // Password validation
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors[0];
    }

    // Confirm password validation
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Password and Confirm Password must be same";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const transformedData = {
        ...formData,
        roleId: getIdByRole(formData.roleId),
        siteId: sites.find((site) => formData.siteId === site.name)?.id,
      };
      delete transformedData.confirm_password;

      await api.post("/users", transformedData);

      toast({
        title: "Success!",
        description: "User created successfully",
      });

      fetchUsersData();
      close();
    } catch (error) {
      console.error(
        "Form submission error",
        error.response?.data?.message || error
      );
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error.response?.data?.messages || "Failed to submit the form.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-12 gap-4">
        {/* Name Field */}
        <div className="col-span-6">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="john wick"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="col-span-6">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@domain.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Phone Field */}
        <div className="col-span-6">
          <Label htmlFor="phone">Phone No.</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="1234567890"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Employee Code Field */}
        {/* <div className="col-span-6">
          <Label htmlFor="code">Employee Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="EMP001"
            value={formData.code}
            onChange={(e) => handleInputChange("code", e.target.value)}
            className={errors.code ? "border-red-500" : ""}
          />
          {errors.code && (
            <p className="text-sm text-red-500 mt-1">{errors.code}</p>
          )}
        </div> */}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Role Field */}
        <div className="col-span-6">
          <Label>Designation</Label>
          <Select
            value={formData.roleId}
            onValueChange={(value) => handleInputChange("roleId", value)}
          >
            <SelectTrigger className={errors.roleId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select designation" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ROLES).map((role) => (
                <SelectItem key={role.name} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.roleId && (
            <p className="text-sm text-red-500 mt-1">{errors.roleId}</p>
          )}
        </div>

        {/* Custom Site Dropdown Field */}
        {![
          "Admin",
          "Mechanical Head",
          "Mechanical Manager",
        ].includes(formData.roleId) && (
            <div className="col-span-6">
              <Label>Select Site</Label>
              <CustomDropdown
                options={sites || []}
                value={formData.siteId}
                onChange={(value) => handleInputChange("siteId", value)}
                placeholder="Select site"
                searchPlaceholder="Search sites..."
                error={!!errors.siteId}
              />
              {errors.siteId && (
                <p className="text-sm text-red-500 mt-1">{errors.siteId}</p>
              )}
            </div>
          )}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Password Field */}
        <div className="col-span-6">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="col-span-6">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirm_password}
              onChange={(e) =>
                handleInputChange("confirm_password", e.target.value)
              }
              className={`pr-10 ${errors.confirm_password ? "border-red-500" : ""
                }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showConfirmPassword ? "Hide password" : "Show password"}
              </span>
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.confirm_password}
            </p>
          )}
        </div>
      </div>

      <div></div>
      <Button type="submit" disabled={loading}>
        {loading ? "Adding User..." : "Add User"}
      </Button>
    </form>
  );
}
