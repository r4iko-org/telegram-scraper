import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { createInterface } from 'readline'; 
import { config } from '../config/config';
import { QueueService } from './queue.service';
import { MessageData } from '../types/types';
import { ApiError, ErrorStatus } from '../utils/error.utils';


const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

export class TelegramService {
  private client: TelegramClient;
  private queueService: QueueService;

  constructor(queueService: QueueService) {
    const session = new StringSession(config.sessionString);
    this.client = new TelegramClient(session, config.apiId, config.apiHash, { connectionRetries: 5 });
    this.queueService = queueService;
  }

  async start() {
    await this.client.start({
      phoneNumber: async () => config.phoneNumber,
      password: async () => await prompt('2FA password (if any, otherwise press Enter): '),
      phoneCode: async () => await prompt('Telegram code: '),
      onError: (err) => console.error('Login error:', err),
    });

    rl.close();

    const savedSession = this.client.session.save();
  
    const channels = config.channels;
    if (channels.length === 0) throw new ApiError(ErrorStatus.BAD_REQUEST, 'At least one channel required!');

    this.client.addEventHandler(async (event: NewMessageEvent) => {
      const message = event.message;

      console.log(`New message from chat: ${message.chatId}, text: ${message.text?.substring(0, 50)}...`);

      const chat = await message.getChat();

      if (chat && 'username' in chat && channels.includes((chat.username || '').toLowerCase())) {
        const data: MessageData = {
          channel: chat.username || (chat as any).title || 'unknown',
          text: message.text || '',
          date: message.date,
          fullMessage: message,
        };

        await this.queueService.addToQueue(data);
      }
    }, new NewMessage({}));

    console.log(`Listening to channels: ${channels.join(', ')}`);
  }

  async close() {
    await this.client.disconnect();
  }
}