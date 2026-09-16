import { prisma } from '../../config/prisma';
import { NewsletterSubscriber } from '../../types';
import { INewsletterRepository } from '../types';

export class PrismaNewsletterRepository implements INewsletterRepository {
  async subscribe(email: string): Promise<NewsletterSubscriber> {
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: { email: email.toLowerCase() },
    });
    return {
      id: subscriber.id,
      email: subscriber.email,
      createdAt: typeof subscriber.createdAt === 'string' ? subscriber.createdAt : subscriber.createdAt.toISOString(),
    };
  }

  async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });
    return subscriber
      ? {
          id: subscriber.id,
          email: subscriber.email,
          createdAt: typeof subscriber.createdAt === 'string' ? subscriber.createdAt : subscriber.createdAt.toISOString(),
        }
      : null;
  }
}

