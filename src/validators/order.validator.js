const { z } = require('zod');
const { emailSchema, nameSchema } = require('./fields.validator');

const createOrderSchema = z.object({
  deliveryAddress: z
    .string({ required_error: 'Delivery address is required' })
    .min(1, 'Delivery address cannot be empty')
    .max(500, 'Delivery address must be at most 500 characters long'),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID format'),
        quantity: z
          .number({ required_error: 'Quantity is required' })
          .int('Quantity must be an integer')
          .positive('Quantity must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
});



const updateOrderStatusSchema = z.object({
  status: z.enum(['PLACED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid order status',
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
