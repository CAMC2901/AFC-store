import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { changePasswordSchema, updateProfileSchema } from '../validators/auth';
import { addressCreateSchema, addressIdSchema, addressUpdateSchema } from '../validators/order';

const router = Router();

router.use(requireAuth);

router.get('/profile', UserController.profile);
router.patch('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.post('/change-password', validate(changePasswordSchema), UserController.changePassword);

router.get('/addresses', UserController.addresses);
router.post('/addresses', validate(addressCreateSchema), UserController.addAddress);
router.patch('/addresses/:addressId', validate(addressIdSchema, 'params'), validate(addressUpdateSchema), UserController.updateAddress);
router.delete('/addresses/:addressId', validate(addressIdSchema, 'params'), UserController.removeAddress);
router.post('/addresses/:addressId/default', validate(addressIdSchema, 'params'), UserController.setDefaultAddress);

export default router;
