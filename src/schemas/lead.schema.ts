import {z} from 'zod'

export const createLeadSchema = z.object({
    companyName: z.string().min(1,'Company name is required'),

    contactName: z.string().min(1,'Contact name is required'),

    email: z.email('Invalid email address'),

    source: z.enum(['LINKEDIN', 'INTRO', 'INBOUND', 'OTHER']),

    status: z.enum(['NEW', 'CONTACTED', 'CALL_DONE', 'DEAL', 'LOST']).optional(),

})

export const leadIdParamSchema = z.object({ id:z.coerce.number().int().positive()})

export const statusEnum= z.enum(['NEW', 'CONTACTED', 'CALL_DONE', 'DEAL', 'LOST'])
export const statusEnumOptional= statusEnum.optional()




export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type StatusType= z.infer<typeof statusEnum>
export type StatusTypeOptional= z.infer<typeof statusEnumOptional>
