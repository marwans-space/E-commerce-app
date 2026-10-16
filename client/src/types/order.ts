const orderSchema = z.object({
  name: z.string().max(100),
  shippingAddress: z.string().max(200),
  number: z.string().min(11).max(20),
});
type;
