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
    firstName: 'Alexis',
    lastName: 'Flerez',
    phone: '+57 (300) 123-4567',
    role: 'ADMIN',
    addresses: [
      {
        label: 'Sede Principal',
        line1: 'Calle 76 # 54-11',
        line2: 'Alto Prado',
        city: 'Barranquilla',
        state: 'Atlántico',
        postalCode: '080001',
        country: 'CO',
        isDefault: true,
      },
    ],
  },
  {
    email: 'customer@afcfurniture.com',
    plainPassword: 'Customer@1234',
    firstName: 'Felipe',
    lastName: 'Flerez',
    phone: '+57 (300) 987-6543',
    role: 'CUSTOMER',
    addresses: [
      {
        label: 'Casa',
        line1: 'Carrera 53 # 82-45',
        city: 'Barranquilla',
        state: 'Atlántico',
        postalCode: '080020',
        country: 'CO',
        isDefault: true,
      },
      {
        label: 'Oficina',
        line1: 'Calle 77B # 57-141',
        line2: 'Piso 8',
        city: 'Barranquilla',
        state: 'Atlántico',
        postalCode: '080001',
        country: 'CO',
        isDefault: false,
      },
    ],
  },
];
