/**
 * Seed data for users
 * Passwords are already hashed with bcrypt (10 rounds)
 */
export const userSeeds = [
  {
    email: 'admin@secondlife.com',
    password: '$2b$10$YQ98PzLBKGqGk8J1H/ZQxOXKZz/rRvYPYZ1QGnPxPl0QxZ5QxZ5Qx', // Password: Admin123!
    firstName: 'Admin',
    lastName: 'Second Life',
    isActive: true,
  },
  {
    email: 'john.doe@example.com',
    password: '$2b$10$N9qo8uLOickgx2ZMRZoMye8P6S8VqcF4z4gT9kZqJz0qxZ5QxZ5Qx', // Password: Password123!
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
  },
  {
    email: 'jane.smith@example.com',
    password: '$2b$10$N9qo8uLOickgx2ZMRZoMye8P6S8VqcF4z4gT9kZqJz0qxZ5QxZ5Qx', // Password: Password123!
    firstName: 'Jane',
    lastName: 'Smith',
    isActive: true,
  },
  {
    email: 'alice.martin@example.com',
    password: '$2b$10$N9qo8uLOickgx2ZMRZoMye8P6S8VqcF4z4gT9kZqJz0qxZ5QxZ5Qx', // Password: Password123!
    firstName: 'Alice',
    lastName: 'Martin',
    isActive: true,
  },
  {
    email: 'bob.wilson@example.com',
    password: '$2b$10$N9qo8uLOickgx2ZMRZoMye8P6S8VqcF4z4gT9kZqJz0qxZ5QxZ5Qx', // Password: Password123!
    firstName: 'Bob',
    lastName: 'Wilson',
    isActive: true,
  },
];
