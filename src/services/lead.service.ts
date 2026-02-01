import type { Lead } from '../generated/prisma/client.js';
import type { CreateLeadInput,StatusType, StatusTypeOptional } from '../schemas/lead.schema.js';
import { sendSlackNotification } from '../lib/slack.js';
import { prisma } from '../lib/database.js'
import { LeadNotFoundError, SlackNotificationError } from './lead.errors.js';


//this function creates a lead
export async function createLead(data: CreateLeadInput): Promise <Lead>{ 
    
    // 1. create lead in pending state
    const lead = await prisma.lead.create({data:{
            ...data,
            status: data.status?? 'NEW', //use provided status, or default to NEW
        },
    })
        
    try{
    //2. Send notification to slack
        await sendSlackNotification(`New business lead from ${data.companyName}, Contact name: ${data.contactName} , Contact email: ${data.email}. We must close this deal guys!!!! Come on!`);
    
    //3. Mark as sent
        const confirmation= await prisma.lead.update({
            where: { id: lead.id},
            data: {newLeadNotification: 'SENT'},
        });

        return confirmation;

    } catch(error){
    //4. Mark as FAILED
        await prisma.lead.update({
            where:{ id: lead.id },
            data: {newLeadNotification: 'FAILED' },

        });

    //5. throw this specific error if slack notification fails

        throw new SlackNotificationError(lead.id, 'NEW LEAD')
    }

}


//this function gets only those leads based on the requested 'status' 
export async function getLeadsByStatus(
  status?: StatusTypeOptional
): Promise<Lead[]> {
  if (!status) {
    return prisma.lead.findMany();
  }

  return prisma.lead.findMany({
    where: { status },
  });
}



//this function updates the status of a lead based for the given lead id
export async function updateLeadStatus(data:{ id: number; status: StatusType }): Promise<Lead>{

    const { id,status } = data

    const existingLead= await prisma.lead.findUnique({
        where:{id}
    })

    if(!existingLead){
        throw new LeadNotFoundError(id)
    }

    const updatedLead= await prisma.lead.update(
    { data: {status:status}, 
      where: {id} 
    })



    if (existingLead.status !== "DEAL" && status==="DEAL"){
         try{
        // Send notification to slack
            await sendSlackNotification(`Business lead from ${updatedLead.companyName} has been closed! Congrats!!`);
        
        // Mark as sent
            return await prisma.lead.update({
                where: { id },
                data: {dealClosedNotification: 'SENT'},
            });

        } catch(error){
        // Mark as FAILED
            await prisma.lead.update({
                where:{ id },
                data: {dealClosedNotification: 'FAILED' },

            });

        // throw this specific error if slack notification fails

            throw new SlackNotificationError(id, 'DEAL CLOSED')
        }

    }         
        return updatedLead
    
}

    
