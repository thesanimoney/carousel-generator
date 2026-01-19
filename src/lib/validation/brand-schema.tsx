import * as z from "zod";
import { DEFAULT_IMAGE_INPUT, ImageSchema } from "./image-schema";

export const BrandSchema = z.object({
  avatar: ImageSchema.default(DEFAULT_IMAGE_INPUT),
  name: z
    .string()
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    })
    .default("Alexander Stoliarchuk"),
  handle: z.string(),
});
