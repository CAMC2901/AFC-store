import { prisma } from '../../config/prisma';
import { Address, PaginatedResult, User } from '../../types';
import {
  CreateAddressInput,
  CreateUserInput,
  IUserRepository,
  UpdateAddressInput,
  UpdateUserInput,
} from '../types';
import { InMemoryUserRepository } from '../index';

const mapUser = (u: any): User => ({
  id: u.id,
  email: u.email,
  passwordHash: u.passwordHash,
  firstName: u.firstName,
  lastName: u.lastName,
  phone: u.phone ?? undefined,
  role: u.role,
  isActive: u.isActive,
  refreshToken: u.sessions?.[0]?.refreshToken ?? null,
  addresses: (u.addresses ?? []).map((a: any) => ({
    id: a.id,
    label: a.label,
    line1: a.line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    isDefault: a.isDefault,
  })),
  createdAt: typeof u.createdAt === 'string' ? u.createdAt : u.createdAt.toISOString(),
  updatedAt: typeof u.updatedAt === 'string' ? u.updatedAt : u.updatedAt.toISOString(),
});

export class PrismaUserRepository implements IUserRepository {
  private fallback = new InMemoryUserRepository();

  async findById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { addresses: true, sessions: { orderBy: { createdAt: 'desc' }, take: 1 } },
      });
      return user ? mapUser(user) : null;
    } catch (err) {
      console.warn('[Prisma User DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findById(id);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { addresses: true, sessions: { orderBy: { createdAt: 'desc' }, take: 1 } },
      });
      return user ? mapUser(user) : null;
    } catch (err) {
      console.warn('[Prisma User DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findByEmail(email);
    }
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<User>> {
    try {
      const total = await prisma.user.count();
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const items = await prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { addresses: true },
        orderBy: { createdAt: 'desc' },
      });
      return {
        items: items.map(mapUser),
        pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      };
    } catch (err) {
      console.warn('[Prisma User DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findAll(page, limit);
    }
  }

  async create(input: CreateUserInput): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash: input.passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          role: (input.role as any) ?? 'CUSTOMER',
        },
        include: { addresses: true },
      });
      return mapUser(user);
    } catch (err) {
      console.warn('[Prisma User DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.create(input);
    }
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(input.firstName !== undefined && { firstName: input.firstName }),
          ...(input.lastName !== undefined && { lastName: input.lastName }),
          ...(input.phone !== undefined && { phone: input.phone }),
          ...(input.email !== undefined && { email: input.email.toLowerCase() }),
          ...(input.passwordHash !== undefined && { passwordHash: input.passwordHash }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        include: { addresses: true },
      });
      return mapUser(user);
    } catch (err) {
      console.warn('[Prisma User DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.update(id, input);
    }
  }

  async setRefreshToken(userId: string, token: string | null): Promise<User | null> {
    try {
      if (token) {
        await prisma.userSession.upsert({
          where: { refreshToken: token },
          update: { refreshToken: token },
          create: {
            userId,
            refreshToken: token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      } else {
        await prisma.userSession.deleteMany({ where: { userId } });
      }
      return this.findById(userId);
    } catch (err) {
      console.warn('[Prisma User DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.setRefreshToken(userId, token);
    }
  }

  async addAddress(userId: string, input: CreateAddressInput): Promise<Address[]> {
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    await prisma.address.create({
      data: {
        userId,
        label: input.label,
        line1: input.line1,
        line2: input.line2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country ?? 'US',
        isDefault: input.isDefault ?? false,
      },
    });
    const updated = await prisma.address.findMany({ where: { userId } });
    return updated.map((a) => ({
      id: a.id,
      label: a.label,
      line1: a.line1,
      line2: a.line2 ?? undefined,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    }));
  }

  async updateAddress(userId: string, addressId: string, input: UpdateAddressInput): Promise<Address[]> {
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    await prisma.address.update({
      where: { id: addressId, userId },
      data: {
        ...(input.label && { label: input.label }),
        ...(input.line1 && { line1: input.line1 }),
        ...(input.line2 !== undefined && { line2: input.line2 }),
        ...(input.city && { city: input.city }),
        ...(input.state && { state: input.state }),
        ...(input.postalCode && { postalCode: input.postalCode }),
        ...(input.country && { country: input.country }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      },
    });
    const updated = await prisma.address.findMany({ where: { userId } });
    return updated.map((a) => ({
      id: a.id,
      label: a.label,
      line1: a.line1,
      line2: a.line2 ?? undefined,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    }));
  }

  async removeAddress(userId: string, addressId: string): Promise<Address[]> {
    await prisma.address.delete({ where: { id: addressId, userId } });
    const remaining = await prisma.address.findMany({ where: { userId } });
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      await prisma.address.update({ where: { id: remaining[0].id }, data: { isDefault: true } });
      remaining[0].isDefault = true;
    }
    return remaining.map((a) => ({
      id: a.id,
      label: a.label,
      line1: a.line1,
      line2: a.line2 ?? undefined,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    }));
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address[]> {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    await prisma.address.update({ where: { id: addressId, userId }, data: { isDefault: true } });
    const updated = await prisma.address.findMany({ where: { userId } });
    return updated.map((a) => ({
      id: a.id,
      label: a.label,
      line1: a.line1,
      line2: a.line2 ?? undefined,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    }));
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }
}
