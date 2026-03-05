const { z } = require('zod');

const chatMessageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(4000)
      })
    )
    .max(20)
    .optional()
    .default([])
});

module.exports = { chatMessageSchema };
