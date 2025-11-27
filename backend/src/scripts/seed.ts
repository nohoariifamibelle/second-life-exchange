import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { userSeeds } from '../../../database/seeds/users.seed';

async function bootstrap() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Créer le contexte de l'application NestJS
    const app = await NestFactory.createApplicationContext(AppModule);

    // Récupérer le modèle User
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    // Compter les utilisateurs existants
    const existingUsersCount = await userModel.countDocuments();
    console.log(`📊 Existing users in database: ${existingUsersCount}\n`);

    let createdCount = 0;
    let skippedCount = 0;

    // Insérer les utilisateurs de seed
    for (const userData of userSeeds) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await userModel.findOne({
          email: userData.email,
        });

        if (existingUser) {
          console.log(`⚠️  User already exists: ${userData.email}`);
          skippedCount++;
        } else {
          // Créer le nouvel utilisateur
          await userModel.create(userData);
          console.log(
            `✅ User created: ${userData.email} (${userData.firstName} ${userData.lastName})`,
          );
          createdCount++;
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`❌ Error creating user ${userData.email}:`, err.message);
      }
    }

    console.log('\n📈 Seeding Summary:');
    console.log(`   ✅ Created: ${createdCount} user(s)`);
    console.log(`   ⚠️  Skipped: ${skippedCount} user(s) (already exist)`);
    console.log(`   📊 Total in database: ${await userModel.countDocuments()}`);

    console.log('\n✅ Seeding completed successfully!\n');

    // Fermer l'application
    await app.close();
    process.exit(0);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('\n❌ Seeding failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

void bootstrap();
