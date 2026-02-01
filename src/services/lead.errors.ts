export class SlackNotificationError extends Error {
    constructor(public leadId: number,public type: 'NEW LEAD' | 'DEAL CLOSED'){
        super(`Slack notification failed: ${type} `);
        this.name= 'SlackNotificationError';
    }
}

export class LeadNotFoundError extends Error {
    constructor(public leadId: number){
        super(`Lead ${leadId} not found`);
        this.name= 'LeadNotFoundError';
    }
}