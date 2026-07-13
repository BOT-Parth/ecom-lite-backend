const { z } = require('zod');

const updateInventorySchema = z.object({
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .nonnegative('Quantity cannot be negative'),
});

module.exports = {
  updateInventorySchema,
};
