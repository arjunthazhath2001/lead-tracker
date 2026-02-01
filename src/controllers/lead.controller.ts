import { createLead, getLeadsByStatus, updateLeadStatus } from "../services/lead.service.js"
import { createLeadSchema, leadIdParamSchema, statusEnum } from "../schemas/lead.schema.js"
import { ZodError } from "zod";
import { LeadNotFoundError, SlackNotificationError } from "../services/lead.errors.js";
import type { Request,Response } from "express";


//handles creation of business leads
export async function createLeadController(req: Request,res: Response){
    try{
        const data= createLeadSchema.parse(req.body);
        const lead= await createLead(data);

        return res.status(201).json({
            lead
        });
    } catch(err){
        if(err instanceof ZodError){
            return res.status(400).json({
                errors: err.message                
            })
        }

        if(err instanceof SlackNotificationError){
            return res.status(502).json({
                message: 'Slack notification failed',
                leadId: err.leadId,
                notificationType: err.type,
            })
        }

        return res.status(500).json({message: 'Internal server error'});
    }

}

//handles fetching of all business leads by status
export async function getLeadsByStatusController(req:Request,res:Response){
    try{
        const status = req.query.status? statusEnum.parse(req.query.status) : undefined;

        const leads= await getLeadsByStatus(status)

        return res.status(200).json({leads})
    } catch(err){
            if(err instanceof ZodError){
                return res.status(400).json({
                errors: err.message                
            })
        }

        return res.status(500).json({'message':'Internal server error'})
    }
}


//handles updation of the status of a business lead

export async function updateLeadStatusController(req: Request,res: Response){

    try{
        const {id}= leadIdParamSchema.parse(req.params);

        const body= statusEnum.parse(req.body.status);
        
        const lead= await updateLeadStatus({id,status:body});

        return res.status(200).json({
            lead,
        });
    } catch(err){
        if(err instanceof ZodError){
            return res.status(400).json({
                errors: err.message                
            })
        }

        if(err instanceof SlackNotificationError){
            return res.status(502).json({
                message: 'Slack notification failed',
                leadId: err.leadId,
                notificationType: err.type,
            })
        }
        
        if(err instanceof LeadNotFoundError){
            return res.status(404).json({
                message: err.message,
                leadId: err.leadId,
            })
        }

        return res.status(500).json({message: 'Internal server error'});
    }

}
