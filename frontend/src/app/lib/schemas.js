import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// AgroBridge — Central Zod Validation Schemas
// ─────────────────────────────────────────────────────────────────────────────

// ── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(3, "Name must be at least 3 characters"),
    nic: z
      .string()
      .min(1, "NIC number is required")
      .regex(/^(\d{9}[VvXx]|\d{12})$/, "Enter a valid NIC (e.g. 123456789V or 200012345678)"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^(\+94|0)[0-9]{9}$/, "Use format: +94XXXXXXXXX or 0XXXXXXXXX"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Listings (Farmer — Create/Edit) ──────────────────────────────────────────

export const listingSchema = z.object({
  paddyType: z.string().min(1, "Please select a paddy type"),
  quantityKg: z
    .union([z.string(), z.number()])
    .refine((v) => Number(v) > 0, "Quantity must be greater than 0"),
  pricePerKg: z
    .union([z.string(), z.number()])
    .refine((v) => Number(v) > 0, "Price must be greater than 0"),
  district: z.string().min(1, "Please select a district"),
  address: z.string().optional(),
  description: z.string().optional(),
});

// ── Buy Request (Mill Owner — Create/Edit) ────────────────────────────────────

export const buyRequestSchema = z.object({
  paddyType: z.string().min(1, "Please select a paddy type"),
  quantityKg: z
    .union([z.string(), z.number()])
    .refine((v) => Number(v) > 0, "Quantity must be greater than 0"),
  pricePerKg: z
    .union([z.string(), z.number()])
    .refine((v) => Number(v) > 0, "Price must be greater than 0"),
  district: z.string().min(1, "Please select a district"),
});

// ── Vehicle (Mill Owner) ──────────────────────────────────────────────────────

export const vehicleSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, "Vehicle number is required")
    .regex(/^[A-Z0-9\-]+$/i, "Enter a valid vehicle number (e.g. LK-AB-1234)"),
  type: z.string().min(1, "Vehicle type is required"),
  capacityKg: z
    .union([z.string(), z.number()])
    .refine((v) => Number(v) > 0, "Capacity must be greater than 0"),
  driverName: z
    .string()
    .min(1, "Driver name is required")
    .min(2, "Driver name must be at least 2 characters"),
  driverPhone: z
    .string()
    .min(1, "Driver phone is required")
    .regex(/^(\+94|0)[0-9]{9}$/, "Use format: +94XXXXXXXXX or 0XXXXXXXXX"),
});

// ── Profile — Farmer ──────────────────────────────────────────────────────────

export const farmerProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(3, "Name must be at least 3 characters"),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^(\+94|0)[0-9]{9}$/.test(v),
      "Use format: +94XXXXXXXXX or 0XXXXXXXXX"
    ),
  operatingDistrict: z.string().optional(),
  landSize: z
    .union([z.string(), z.number()])
    .optional()
    .refine((v) => v === "" || v === undefined || Number(v) >= 0, "Must be 0 or more"),
  estimatedMonthlyStock: z
    .union([z.string(), z.number()])
    .optional()
    .refine((v) => v === "" || v === undefined || Number(v) >= 0, "Must be 0 or more"),
  paddyTypesCultivated: z.string().optional(),
});

// ── Profile — Mill Owner ──────────────────────────────────────────────────────

export const millOwnerProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(3, "Name must be at least 3 characters"),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^(\+94|0)[0-9]{9}$/.test(v),
      "Use format: +94XXXXXXXXX or 0XXXXXXXXX"
    ),
  businessName: z.string().optional(),
  millLocation: z.string().optional(),
  millCapacity: z
    .union([z.string(), z.number()])
    .optional()
    .refine((v) => v === "" || v === undefined || Number(v) >= 0, "Must be 0 or more"),
  businessPhone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^(\+94|0)[0-9]{9}$/.test(v),
      "Use format: +94XXXXXXXXX or 0XXXXXXXXX"
    ),
});
