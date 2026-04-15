import { Injectable } from '@nestjs/common';
import type { User, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type JwtPayload = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export type UserWithRoles = User & { roles: { role: Role }[] };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureFromJwt(payload: JwtPayload): Promise<UserWithRoles> {
    const email = payload.email ?? `${payload.sub}@users.auth0.local`;
    const customerRole = await this.prisma.role.findUniqueOrThrow({
      where: { slug: 'customer' },
    });

    const user = await this.prisma.user.upsert({
      where: { auth0Sub: payload.sub },
      update: {
        email,
        emailVerified: Boolean(payload.email_verified),
        name: payload.name ?? undefined,
        avatarUrl: payload.picture ?? undefined,
      },
      create: {
        auth0Sub: payload.sub,
        email,
        emailVerified: Boolean(payload.email_verified),
        name: payload.name ?? undefined,
        avatarUrl: payload.picture ?? undefined,
        roles: {
          create: { roleId: customerRole.id },
        },
      },
      include: { roles: { include: { role: true } } },
    });

    return user as UserWithRoles;
  }

  async findById(id: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    }) as Promise<UserWithRoles | null>;
  }

  async assignRole(userId: string, roleSlug: string) {
    const role = await this.prisma.role.findUniqueOrThrow({ where: { slug: roleSlug } });
    await this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    });
  }

  async listUsers(skip = 0, take = 50) {
    return this.prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { roles: { include: { role: true } } },
    });
  }

  async updateProfile(userId: string, data: { name?: string; notificationPrefs?: object }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        notificationPrefs: data.notificationPrefs as object,
      },
    });
  }
}
