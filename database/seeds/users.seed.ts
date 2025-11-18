import * as bcrypt from 'bcrypt';

/**
 * Données de seed pour les utilisateurs
 * Les mots de passe sont déjà hachés avec bcrypt (10 rounds)
 */
export const userSeeds = [
  {
    email: 'admin@secondlife.com',
    password: bcrypt.hashSync('Admin123!', 10), // Password: Admin123!
    firstName: 'Admin',
    lastName: 'Second Life',
    isActive: true,
  },
  {
    email: 'john.doe@example.com',
    password: bcrypt.hashSync('Password123!', 10), // Password: Password123!
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
  },
  {
    email: 'jane.smith@example.com',
    password: bcrypt.hashSync('Password123!', 10), // Password: Password123!
    firstName: 'Jane',
    lastName: 'Smith',
    isActive: true,
  },
  {
    email: 'alice.martin@example.com',
    password: bcrypt.hashSync('Password123!', 10), // Password: Password123!
    firstName: 'Alice',
    lastName: 'Martin',
    isActive: true,
  },
  {
    email: 'bob.wilson@example.com',
    password: bcrypt.hashSync('Password123!', 10), // Password: Password123!
    firstName: 'Bob',
    lastName: 'Wilson',
    isActive: true,
  },
];
