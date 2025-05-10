import * as z from "zod"; // Ensure '*' import for Zod v3

// Base Product Schema (Common fields)
export const baseProductSchema = z.object({
  // id: z.string().optional(), // Optional for create, required for update
  name: z.string().min(3, { message: "Name must be at least 3 characters long." }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }).max(1000).optional(),
  basePrice: z.coerce.number().positive({ message: "Base price must be a positive number." }).optional(),
});

// Enum for Product Type
export const ProductTypeEnum = z.enum(["RESOURCE", "SERVICE"], {
  required_error: "Product type is required.",
});

// Enum for Action Type (if needed elsewhere, kept for context)
export const ActionTypeEnum = z.enum(["CREATE", "READ", "UPDATE", "DELETE", "CUSTOM"]);

// Schema for the main form type selection (used to determine which other fields are relevant)
export const productFormTypeSchema = z.object({
  productType: ProductTypeEnum,
});

// Schema parts - these will be conditionally merged or processed
const coreProductFieldsSchema = baseProductSchema.extend({
  productType: ProductTypeEnum, // This must be present to discriminate
});

const schedulingFieldsBaseSchema = z.object({
  isScheduled: z.boolean().default(false).optional(),
  scheduledAt: z.date().optional(), // ISO date string
  // scheduledAt: z.string().optional().refine((date) => {
  //   const parsedDate = new Date(date);
  //   return !isNaN(parsedDate.getTime());
  // }, { message: "Invalid date format." }),
});

const customActionFieldsBaseSchema = z.object({
  isCustomAction: z.boolean().default(false).optional(),
  customActionQuery: z.string().optional(),
});

// We will now create a combined schema and apply refinements at the end.
// This is often easier than trying to merge ZodEffects.
export const fullProductFormSchema = coreProductFieldsSchema
  .merge(schedulingFieldsBaseSchema)
  .merge(customActionFieldsBaseSchema)
  .superRefine((data, ctx) => { // Use superRefine for complex cross-field validation
    // Scheduling validation
    if (data.isScheduled && !data.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled date is required when scheduling is enabled.",
        path: ["scheduledAt"],
      });
    }
    if (data.isScheduled && data.scheduledAt && data.scheduledAt < new Date(new Date().setHours(0, 0, 0, 0))) { // Compare date part only for "past"
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled date cannot be in the past.",
        path: ["scheduledAt"],
      });
    }

    // Custom action validation
    if (data.isCustomAction && (!data.customActionQuery || data.customActionQuery.trim().length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom action query is required (min 3 characters) when custom action is enabled.",
        path: ["customActionQuery"],
      });
    }
  });

// Type inferred from the Zod schema
export type ProductFormData = z.infer<typeof fullProductFormSchema>;