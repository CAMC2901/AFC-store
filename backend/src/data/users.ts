export interface UserSeed {
  email: string;
  plainPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER';
  addresses: Array<{
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
}

/** Demo credentials: admin@afcfurniture.com / Admin@1234 — customer@afcfurniture.com / Customer@1234 */
export const usersSeed: UserSeed[] = [
  {
    email: 'admin@afcfurniture.com',
    plainPassword: 'Admin@1234',
    firstName: 'Alex',
    lastName: 'Foster',
    phone: '+1 (555) 100-2000',
    role: 'ADMIN',
    addresses: [
      {
        label: 'HQ',
        line1: '1280 Fifth Avenue',
        line2: 'Suite 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10029',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'customer@afcfurniture.com',
    plainPassword: 'Customer@1234',
    firstName: 'Dana',
    lastName: 'Reyes',
    phone: '+1 (555) 300-4000',
    role: 'CUSTOMER',
    addresses: [
      {
        label: 'Home',
        line1: '412 Willow Lane',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'US',
        isDefault: true,
      },
      {
        label: 'Work',
        line1: '900 Congress Ave',
        line2: 'Floor 12',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'US',
        isDefault: false,
      },
    ],
  },
];
