import { QueueService } from './services/queue.service';
import { TelegramService } from './services/telegram.service';
import { setupGlobalErrorHandlers } from './utils/error.utils';

async function main() {
  setupGlobalErrorHandlers();

  const queueService = new QueueService();
  const telegramService = new TelegramService(queueService);

  try {
    await telegramService.start();
    process.on('SIGINT', async () => {
      await telegramService.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('Main  error:', (err as Error).message);
    process.exit(1);
  }
}

main();