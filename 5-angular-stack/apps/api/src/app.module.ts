import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { HealthController } from './health/health.controller';
import { PagesModule } from './pages/pages.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { AuthorsModule } from './authors/authors.module';
import { ProductsModule } from './products/products.module';
import { PlansModule } from './plans/plans.module';
import { OrdersModule } from './orders/orders.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { FormsModule } from './forms/forms.module';
import { MediaModule } from './media/media.module';
import { NavigationModule } from './navigation/navigation.module';
import { SettingsModule } from './settings/settings.module';
import { SearchModule } from './search/search.module';
import { StripeModule } from './stripe/stripe.module';
import { MailModule } from './mail/mail.module';
import { SeoModule } from './seo/seo.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GatedModule } from './gated/gated.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    MailModule,
    PagesModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    AuthorsModule,
    ProductsModule,
    PlansModule,
    OrdersModule,
    SubscriptionsModule,
    FormsModule,
    MediaModule,
    NavigationModule,
    SettingsModule,
    SearchModule,
    StripeModule,
    SeoModule,
    AnalyticsModule,
    GatedModule,
    FavoritesModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
