import {z} from 'zod'

export const createLeadSchema = z.object({
    companyName: z.string().min(1,'Company name is requred'),

    contactName: z.string().min(1,'Contact name is required'),

    email: z.email('Invalid email address'),

    source: z.enum(['LINKEDIN', 'INTRO', 'INBOUND', 'OTHER']),

    status: z.enum(['NEW', 'CONTACTED', 'CALL_DONE', 'DEAL', 'LOST']).optional(),

})

export const getLeadsByStatusSchema= z.object({
    status: z.enum(['NEW', 'CONTACTED', 'CALL_DONE', 'DEAL', 'LOST'])
})

export const updateLeadStatusSchema = z.object({
    id: z.number(),
    status: z.enum(['NEW', 'CONTACTED', 'CALL_DONE', 'DEAL', 'LOST'])
})