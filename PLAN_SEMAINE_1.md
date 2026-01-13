# 🎯 PLAN D'ACTION DÉTAILLÉ - SEMAINE 1 (7 JOURS)

**Projet** : Second Life Exchange
**Deadline** : 04 février 2026
**Période** : Semaine 1 (Fondations)

---

## 📋 PRÉPARATION INITIALE (Avant Jour 1)

### Étape 1 : Installation des dépendances supplémentaires

**Backend :**

```bash
cd backend
npm install cloudinary multer @nestjs/throttler cookie-parser
npm install -D @types/multer @types/cookie-parser
```

----- Packages -----
cloudinary :
Cloudinary est un service SaaS de gestion d’assets médias (images, vidéos, fichiers).
Le package npm permet d’interagir avec l’API Cloudinary depuis une application Node.js afin de téléverser, stocker, transformer et diffuser des médias.

multer :
Multer est un middleware Express dédié à la gestion des uploads de fichiers via des requêtes multipart/form-data.

@types/multer :
@types/multer fournit les définitions TypeScript pour le package multer.

@nestjs/throttler :
@nestjs/throttler est un module officiel NestJS permettant d’implémenter du rate limiting (limitation du nombre de requêtes).

cookie-parser :
cookie-parser est un middleware Express qui permet de parser les cookies présents dans les headers HTTP des requêtes entrantes.

@types/cookie-parser
@types/cookie-parser fournit les types TypeScript pour cookie-parser.

**Frontend :**

```bash
cd frontend
npm install react-hot-toast @radix-ui/react-toast class-variance-authority clsx tailwind-merge
npm install lucide-react
```

----- Packages -----
react-hot-toast :
react-hot-toast est une librairie React permettant d’afficher des notifications toast légères et non bloquantes.

@radix-ui/react-toast :
@radix-ui/react-toast est un composant headless (sans styles) de Radix UI dédié à la gestion des toasts accessibles.

class-variance-authority (CVA) :
class-variance-authority est un utilitaire permettant de gérer des variantes de classes CSS de manière déclarative.

clsx :
clsx est une librairie utilitaire minimaliste permettant de composer conditionnellement des classes CSS.

tailwind-merge :
tailwind-merge est un utilitaire qui permet de résoudre les conflits entre classes Tailwind CSS.

lucide-react :
lucide-react est une librairie d’icônes SVG pour React, basée sur le set open-source Lucide.

---

### Étape 2 : Configuration Cloudinary

1. Créer un compte gratuit sur https://console.cloudinary.com/
2. Récupérer les credentials (Cloud Name, API Key, API Secret)
3. Mettre à jour le fichier `.env` backend avec les vraies valeurs

---

## 🔥 JOUR 1 - LOGIN + JWT (Access + Refresh Tokens)

### Backend

**Fichiers à créer/modifier :**

#### 1. `backend/src/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Utilisateur non trouvé ou inactif");
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

#### 2. `backend/src/auth/strategies/jwt-refresh.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("REFRESH_TOKEN_SECRET"),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Utilisateur non trouvé ou inactif");
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

#### 3. `backend/src/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

#### 4. `backend/src/auth/guards/jwt-refresh-auth.guard.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard("jwt-refresh") {}
```

#### 5. `backend/src/auth/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### 6. `backend/src/auth/dto/login.dto.ts`

```typescript
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Email invalide" })
  @IsNotEmpty({ message: "Email requis" })
  email: string;

  @IsString()
  @IsNotEmpty({ message: "Mot de passe requis" })
  password: string;
}
```

#### 7. Mettre à jour `backend/src/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Compte désactivé");
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role || "user",
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: this.configService.get<string>("JWT_EXPIRES_IN"),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
      expiresIn: this.configService.get<string>("REFRESH_TOKEN_EXPIRES_IN"),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || "user",
      },
    };
  }

  async refreshToken(user: any) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: this.configService.get<string>("JWT_EXPIRES_IN"),
    });

    return {
      accessToken,
    };
  }
}
```

#### 8. Mettre à jour `backend/src/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/public.decorator";
import { JwtRefreshAuthGuard } from "./guards/jwt-refresh-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post("refresh")
  refresh(@Request() req) {
    return this.authService.refreshToken(req.user);
  }
}
```

#### 9. Mettre à jour `backend/src/auth/auth.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

#### 10. Mettre à jour `backend/src/users/schemas/user.schema.ts`

```typescript
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: "user", enum: ["user", "admin"] })
  role: string;

  @Prop({ default: "" })
  bio: string;

  @Prop({ default: "" })
  phone: string;

  @Prop({ default: "" })
  city: string;

  @Prop({ default: "" })
  address: string;

  @Prop({ default: "" })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

#### 11. Ajouter `findById` dans `backend/src/users/users.service.ts`

```typescript
// Ajouter cette méthode
async findById(id: string): Promise<User | null> {
  return this.userModel.findById(id).exec();
}
```

#### 12. Mettre à jour `backend/src/main.ts`

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
bootstrap();
```

### Frontend

#### 13. `frontend/src/contexts/AuthContext.tsx`

```typescript
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedAccessToken = sessionStorage.getItem("accessToken");
    const storedRefreshToken = sessionStorage.getItem("refreshToken");
    const storedUser = sessionStorage.getItem("user");

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur de connexion");
    }

    const data = await response.json();

    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);

    router.push("/");
  };

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, refreshToken, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

#### 14. `frontend/src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Second Life Exchange",
  description: "Plateforme d'échange d'objets de seconde main",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### 15. `frontend/src/app/login/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Connexion réussie !");
    } catch (error: any) {
      toast.error(error.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Connexion</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Points de validation Jour 1

1. Démarrer le backend : `cd backend && npm run start:dev`
2. Tester le login via Postman/Thunder Client :
   - POST `http://localhost:3001/auth/login`
   - Body : `{ "email": "test@test.com", "password": "Test123!" }`
3. Vérifier que le frontend affiche le message de bienvenue après login
4. Tester le refresh token : POST `http://localhost:3001/auth/refresh` avec le refreshToken dans le header

---

**Continuer avec les jours 2-7 ? Réponds "OUI" pour que je génère la suite du plan.**
