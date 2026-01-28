import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { userSeeds } from '../database/seeds/users.seed';

async function bootstrap() {
  console.log('Starting database seeding...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userModel = app.get(getModelToken(User.name));

    const existingUsersCount = await userModel.countDocuments();
    console.log(`Existing users in database: ${existingUsersCount}\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of userSeeds) {
      try {
        const existingUser = await userModel.findOne({
          email: userData.email,
        });

        if (existingUser) {
          console.log(`User already exists: ${userData.email}`);
          skippedCount++;
        } else {
          await userModel.create(userData);
          console.log(
            `User created: ${userData.email} (${userData.firstName} ${userData.lastName})`,
          );
          createdCount++;
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`Error creating user ${userData.email}:`, err.message);
      }
    }

    console.log('\nSeeding Summary:');
    console.log(`   Created: ${createdCount} user(s)`);
    console.log(`   Skipped: ${skippedCount} user(s) (already exist)`);
    console.log(`   Total in database: ${await userModel.countDocuments()}`);
    console.log('\nSeeding completed successfully!\n');

    await app.close();
    process.exit(0);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('\nSeeding failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

void bootstrap();
