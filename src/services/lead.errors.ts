export class SlackNotificationError extends Error {
    constructor(public leadId: number){
        super('Slack notification failed');
        this.name= 'SlackNotificationError';
    }
}

export class LeadNotFoundError extends Error {
    constructor(public leadId: number){
        super(`Lead ${leadId} not found`);
        this.name= 'LeadNotFoundError';
    }
}