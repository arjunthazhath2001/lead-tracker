import { createLead, getLeadsByStatus } from "../services/lead.service.js"
import { createLeadSchema, getLeadsByStatusSchema } from "../schemas/lead.schema.js"
import { ZodError } from "zod";
import { SlackNotificationError } from "../services/lead.errors.js";
import type { Request,Response } from "express";

export async function createLeadController(req: Request,res: Response){
    try{
        const data= createLeadSchema.parse(req.body);
        const lead= await createLead(data);

        return res.status(201).json({
            lead,
            notification: 'SENT'
        });
    } catch(err){
        if(err instanceof ZodError){
            return res.status(400).json({
                errors: err.message                
            })
        }

        if(err instanceof SlackNotificationError){
            return res.status(202).json({
                message: 'Lead created but notification failed',
                leadId: err.leadId,
                notification: 'FAILED',
                actionRequired: true,
            })
        }

        return res.status(500).json({message: 'Internal server error'});
    }

}

export async function getLeadsByStatusController(req:Request,res:Response){
    try{
        const data= getLeadsByStatusSchema.parse(req.body)
        const lead= await getLeadsByStatus(data)

        return res.status(201).json({lead})
    } catch(err){
        return res.status(500).json({'message':'Internal server error'})
    }
}