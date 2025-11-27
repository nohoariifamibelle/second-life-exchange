import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

// Mock bcrypt au niveau du module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let model: Model<UserDocument>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    toObject: jest.fn().mockReturnThis(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should successfully create a new user with hashed password', async () => {
      // Arrange
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      mockUserModel.create.mockResolvedValue({
        ...mockUser,
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      });

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(result.email).toBe(createUserDto.email);
      expect(result.password).not.toBe(createUserDto.password); // Password should be hashed
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Cet email est déjà utilisé',
      );
    });

    it('should hash password using bcrypt with salt rounds 10', async () => {
      // Arrange
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      mockUserModel.create.mockResolvedValue(mockUser);

      // Act
      await service.create(createUserDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should not store plain text password', async () => {
      // Arrange
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      const savedUser = { ...mockUser, password: 'hashedPassword123' };
      mockUserModel.create.mockResolvedValue(savedUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result.password).not.toBe(createUserDto.password);
      expect(result.password).toBe('hashedPassword123');
    });
  });

  describe('findByEmail', () => {
    it('should return a user if email exists', async () => {
      // Arrange
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      // Act
      const result = await service.findByEmail('test@example.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should return null if email does not exist', async () => {
      // Arrange
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Act
      const result = await service.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });
});
