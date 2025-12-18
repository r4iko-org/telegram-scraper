import axios from 'axios';
import { config } from '../config/config';
import { MessageData } from '../types/types';

interface QueuedItem {
  data: MessageData;
  attempts: number;
  lastAttempt: number;
  addedAt: number;
}

export class QueueService {
  private queueMap = new Map<bigint, QueuedItem>();

  private readonly MAX_PENDING = 100;
  private readonly MAX_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 5000;

  constructor() {
    this.startRetryWorker();
  }

  async addToQueue(data: MessageData) {
    const messageId = BigInt(data.fullMessage.id);

    if (this.queueMap.has(messageId)) {
      console.log(`Duplicate message skipped: ${messageId}`);
      return;
    }

    const item: QueuedItem = {
      data,
      attempts: 0,
      lastAttempt: 0,
      addedAt: Date.now(),
    };

    if (this.queueMap.size >= this.MAX_PENDING) {
      const oldestId = this.getOldestMessageId();
      if (oldestId !== null) {
        this.queueMap.delete(oldestId);
        console.warn(`Limit exceeded, oldest message deleted: ${oldestId}`);
      }
    }

    this.queueMap.set(messageId, item);
    this.processItem(messageId);
  }

  private getOldestMessageId(): bigint | null {
    let oldestId: bigint | null = null;
    let oldestTime = Infinity;

    for (const [id, item] of this.queueMap.entries()) {
      if (item.addedAt < oldestTime) {
        oldestTime = item.addedAt;
        oldestId = id;
      }
    }
    return oldestId;
  }

  private async processItem(messageId: bigint) {
    const item = this.queueMap.get(messageId);
    if (!item) return;

    item.attempts++;
    item.lastAttempt = Date.now();

    console.log(`Processing (attempt ${item.attempts}/${this.MAX_ATTEMPTS}): ID ${messageId} - ${item.data.text.substring(0, 50)}...`);

    let success = false;

    if (config.webhookUrl) {
      try {
        await axios.post(config.webhookUrl, item.data, { timeout: 8000 });
        success = true;
      } catch (err: any) {
        console.error(`Webhook error (ID: ${messageId}, attempt ${item.attempts}): ${err.message}`);
      }
    } else {
      success = true;
    }

    if (success) {
      this.queueMap.delete(messageId);
      console.log(`Success, message deleted: ${messageId}`);
    } else if (item.attempts >= this.MAX_ATTEMPTS) {
      this.queueMap.delete(messageId);
      console.warn(`Max attempts exceeded, message abandoned: ${messageId}`);
    }
  }

  private startRetryWorker() {
    setInterval(() => {
      const now = Date.now();
      for (const [messageId, item] of this.queueMap.entries()) {
        if (
          item.attempts < this.MAX_ATTEMPTS &&
          (now - item.lastAttempt) >= this.RETRY_DELAY
        ) {
          this.processItem(messageId);
        }
      }
    }, 2000);
  }

  getPendingCount(): number {
    return this.queueMap.size;
  }

  logPending() {
    console.log(`Pending messages (${this.queueMap.size}/${this.MAX_PENDING}):`,
      Array.from(this.queueMap.keys()).slice(0, 10)
    );
  }
}