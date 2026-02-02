import type { Lead } from '../generated/prisma/client.js';
import type { CreateLeadInput,StatusType, StatusTypeOptional } from '../schemas/lead.schema.js';
import { sendSlackNotification } from '../lib/slack.js';
import { prisma } from '../lib/database.js'
import { DuplicateLeadEmailError, LeadNotFoundError, SlackNotificationError } from './lead.errors.js';


// this function creates a lead
export async function createLead(data: CreateLeadInput): Promise<Lead> {
  let lead: Lead | null = null;
  let attemptedNotification: 'NEW LEAD' | 'DEAL CLOSED' | null = null;

  const finalStatus = data.status ?? 'NEW';

  try {
    // 1. Create lead (DB is the source of truth)
    lead = await prisma.lead.create({
      data: {
        ...data,
        status: finalStatus,
      },
    });

    // 2. Send NEW lead notification only if status is NEW
    if (finalStatus === 'NEW') {
      attemptedNotification = 'NEW LEAD';

      await sendSlackNotification(
        `New business lead from ${data.companyName}, Contact: ${data.contactName}, Email: ${data.email}`
      );

      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: { newLeadNotification: 'SENT' },
      });
    }

    // 3. Send DEAL notification only if status is DEAL
    if (finalStatus === 'DEAL') {
      attemptedNotification = 'DEAL CLOSED';

      await sendSlackNotification(
        `Business lead from ${data.companyName} has been closed! Congrats!!`
      );

      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: { dealClosedNotification: 'SENT' },
      });
    }

    return lead;

  } catch (err) {
    // Duplicate email (domain error)
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      err.code === 'P2002'
    ) {
      throw new DuplicateLeadEmailError(data.email);
    }

    // Slack failure (resource error)
    if (lead && attemptedNotification) {
      const updateField =
        attemptedNotification === 'NEW LEAD'
          ? 'newLeadNotification'
          : 'dealClosedNotification';

      const updatedLead = await prisma.lead.update({
        where: { id: lead.id },
        data: { [updateField]: 'FAILED' },
      });

      throw new SlackNotificationError(
        lead.id,
        attemptedNotification,
        updatedLead
      );
    }

    // Anything else is truly unexpected
    throw err;
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
export async function updateLeadStatus(
  data: { id: number; status: StatusType }
): Promise<{ lead: Lead; changed: boolean }> {

  const { id, status } = data;

  const existingLead = await prisma.lead.findUnique({ where: { id } });

  if (!existingLead) {
    throw new LeadNotFoundError(id);
  }

  const isSameStatus = existingLead.status === status;

  const needsNewLeadNotification =
    status === 'NEW' &&
    existingLead.newLeadNotification !== 'SENT';

  const needsDealNotification =
    status === 'DEAL' &&
    existingLead.dealClosedNotification !== 'SENT';

  const needsAnyNotification =
    needsNewLeadNotification || needsDealNotification;

  // True NO-OP: no state change AND no pending side-effects
  if (isSameStatus && !needsAnyNotification) {
    return { lead: existingLead, changed: false };
  }

  // Update status only if it actually changed
  const updatedLead = isSameStatus
    ? existingLead
    : await prisma.lead.update({
        where: { id },
        data: { status },
      });

  // Retry NEW lead notification
  if (needsNewLeadNotification) {
    try {
      await sendSlackNotification(
        `New business lead from ${updatedLead.companyName}, Contact: ${updatedLead.contactName}, Email: ${updatedLead.email}`
      );

      const confirmed = await prisma.lead.update({
        where: { id },
        data: { newLeadNotification: 'SENT' },
      });

      return { lead: confirmed, changed: !isSameStatus };

    } catch {
      const failedLead = await prisma.lead.update({
        where: { id },
        data: { newLeadNotification: 'FAILED' },
      });

      throw new SlackNotificationError(id, 'NEW LEAD', failedLead);
    }
  }

  // Retry DEAL notification
  if (needsDealNotification) {
    try {
      await sendSlackNotification(
        `Business lead from ${updatedLead.companyName} has been closed! Congrats!!`
      );

      const confirmed = await prisma.lead.update({
        where: { id },
        data: { dealClosedNotification: 'SENT' },
      });

      return { lead: confirmed, changed: !isSameStatus };

    } catch {
      const failedLead = await prisma.lead.update({
        where: { id },
        data: { dealClosedNotification: 'FAILED' },
      });

      throw new SlackNotificationError(id, 'DEAL CLOSED', failedLead);
    }
  }

  return { lead: updatedLead, changed: !isSameStatus };
}
