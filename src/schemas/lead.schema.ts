import {z} from 'zod'

export const createLeadSchema = z.object({
    companyName: z.string().trim().min(1,'Company name is required').max(200, 'Company name must be 200 characters or less'),

    contactName: z.string().trim().min(1,'Contact name is required').max(100, 'Contact name must be 100 characters or less'),

    email: z.email('Invalid email address').transform(email => email.trim().toLowerCase()),

    source: z.enum(['LINKEDIN', 'INTRO', 'INBOUND', 'OTHER']),

    status: z.enum(['NEW', 'CONTACTED', 'CALL_DONE', 'DEAL', 'LOST']).optional(),

}).strict()

export const leadIdParamSchema = z.object({ id:z.coerce.number().int().positive()})

export const statusEnum= z.enum(['NEW', 'CONTACTED', 'CALL_DONE', 'DEAL', 'LOST'])

export const statusEnumOptional= statusEnum.optional()

export const updateLeadStatusSchema = z.object({
  status: statusEnum
}).strict();




export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type StatusType= z.infer<typeof statusEnum>
export type StatusTypeOptional= z.infer<typeof statusEnumOptional>
