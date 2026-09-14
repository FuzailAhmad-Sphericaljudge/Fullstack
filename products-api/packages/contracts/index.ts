import { z } from 'zod';

export const productInput = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.number().finite().nonnegative(),
  description: z.string().max(2000).default(''),
  stock: z.number().int().nonnegative().default(0),
}).strict();
export const productPatch = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  price: z.number().finite().nonnegative().optional(),
  description: z.string().max(2000).optional(),
  stock: z.number().int().nonnegative().optional(),
}).strict().refine(value => Object.keys(value).length > 0, 'Provide at least one field');
export const productSchema = productInput.extend({
  id: z.uuid(), createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(),
});
export type Product = z.infer<typeof productSchema>;
