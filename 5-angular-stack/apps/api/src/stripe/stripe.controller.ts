import { Body, Controller, Headers, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { IsUrl } from 'class-validator';
import type { Request } from 'express';
import { IsArray, IsEmail, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StripeService } from './stripe.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';

class LineItemDto {
  @IsString()
  price!: string;

  @IsOptional()
  quantity = 1;
}

class BillingPortalDto {
  @IsUrl({ require_tld: false })
  returnUrl!: string;
}

class CheckoutDto {
  @IsIn(['payment', 'subscription'])
  mode!: 'payment' | 'subscription';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems!: LineItemDto[];

  @IsOptional()
  @IsEmail()
  email?: string;
}

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
  ) {}

  @Post('webhook')
  @SkipThrottle()
  @Public()
  @HttpCode(200)
  async webhook(
    @Req() req: Request & { body: Buffer },
    @Headers('stripe-signature') sig: string,
  ) {
    const body = req.body as Buffer;
    return this.stripe.handleWebhook(body, sig);
  }

  @Post('billing-portal')
  @UseGuards(JwtAuthGuard)
  async billingPortal(@CurrentUser() user: RequestUser, @Body() dto: BillingPortalDto) {
    return this.stripe.createBillingPortalForUser(user.id, dto.returnUrl);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@CurrentUser() user: RequestUser, @Body() dto: CheckoutDto) {
    const publicUrl = this.config.getOrThrow<string>('PUBLIC_APP_URL');
    return this.stripe.createCheckoutSession({
      mode: dto.mode,
      successUrl: `${publicUrl}/thank-you`,
      cancelUrl: `${publicUrl}/cart`,
      lineItems: dto.lineItems.map((l) => ({
        price: l.price,
        quantity: l.quantity ?? 1,
      })),
      customerEmail: dto.email ?? user.email,
      clientReferenceId: user.id,
    });
  }
}
