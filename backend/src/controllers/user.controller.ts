import { Request, Response } from 'express';
import { repositories } from '../repositories/container';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { success, NotFoundError, UnauthorizedError, ConflictError } from '../utils/error';
import { hashPassword, verifyPassword } from '../utils/password';
import { PublicUser } from '../types';

const toPublic = (user: NonNullable<Awaited<ReturnType<typeof repositories.users.findById>>>): PublicUser => {
  const { passwordHash: _ph, refreshToken: _rt, ...safe } = user;
  return safe;
};

export const UserController = {
  profile: async (req: Request, res: Response) => {
    const user = await repositories.users.findById(req.userId!);
    if (!user) throw new NotFoundError('User');
    res.json(success({ user: toPublic(user) }));
  },

  updateProfile: async (req: Request, res: Response) => {
    const input = req.body as { firstName?: string; lastName?: string; phone?: string; email?: string };
    if (input.email) {
      const other = await repositories.users.findByEmail(input.email);
      if (other && other.id !== req.userId) throw new ConflictError('Email is already in use.');
    }
    const user = await repositories.users.update(req.userId!, input);
    if (!user) throw new NotFoundError('User');
    res.json(success({ user: toPublic(user) }, 'Profile updated.'));
  },

  changePassword: async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    const user = await repositories.users.findById(req.userId!);
    if (!user) throw new NotFoundError('User');
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Current password is incorrect.');

    const passwordHash = await hashPassword(newPassword);
    await repositories.users.update(req.userId!, { passwordHash });
    await AuthService.setRefreshToken(user.id, null);
    res.json(success(null, 'Password changed. Please log in again.'));
  },

  addresses: async (req: Request, res: Response) => {
    const user = await repositories.users.findById(req.userId!);
    if (!user) throw new NotFoundError('User');
    res.json(success({ addresses: user.addresses }));
  },

  addAddress: async (req: Request, res: Response) => {
    const addresses = await repositories.users.addAddress(req.userId!, req.body);
    res.status(201).json(success({ addresses }, 'Address added.'));
  },

  updateAddress: async (req: Request, res: Response) => {
    const addresses = await repositories.users.updateAddress(req.userId!, req.params.addressId, req.body);
    res.json(success({ addresses }, 'Address updated.'));
  },

  removeAddress: async (req: Request, res: Response) => {
    const addresses = await repositories.users.removeAddress(req.userId!, req.params.addressId);
    res.json(success({ addresses }, 'Address removed.'));
  },

  setDefaultAddress: async (req: Request, res: Response) => {
    const addresses = await repositories.users.setDefaultAddress(req.userId!, req.params.addressId);
    res.json(success({ addresses }, 'Default address updated.'));
  },

  cartState: async (req: Request, res: Response) => {
    const [lines, count, wishlist] = await Promise.all([
      CartService.hydrate(req.userId!),
      CartService.count(req.userId!),
      WishlistService.list(req.userId!),
    ]);
    res.json(success({ cart: { lines, count }, wishlist }));
  },
};
