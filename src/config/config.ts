import dotenv from 'dotenv';
dotenv.config();

export const config = {
  apiId: parseInt(process.env.API_ID || '0', 10),
  apiHash: process.env.API_HASH || '',
  phoneNumber: process.env.PHONE_NUMBER || '',
  sessionString: process.env.SESSION_STRING || '',
  channels: (process.env.CHANNELS || '').split(',').map(c => c.trim().replace('@', '').toLowerCase()),
  webhookUrl: process.env.WEBHOOK_URL || '',
};

if (!config.apiId || !config.apiHash || !config.phoneNumber) {
  throw new Error('API_ID, API_HASH, and PHONE_NUMBER are required!');
}