import { IncomingWebhook } from '@slack/webhook';

const url = process.env.SLACK_WEBHOOK_URL;

if(!url){
    throw new Error('SLACK_WEBHOOK_URL env variable is not set')
}

const webhook = new IncomingWebhook(url);

// Send the notification
export async function sendSlackNotification(text:string) {
  await webhook.send({text});
}
