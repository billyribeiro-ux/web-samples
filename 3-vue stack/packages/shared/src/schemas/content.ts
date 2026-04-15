import { z } from "zod";

export const contentStatusSchema = z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]);

export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
