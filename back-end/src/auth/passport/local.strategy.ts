
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadGatewayException, BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.error("User not found or invalid credentials");
      throw new UnauthorizedException("1");
    }
    //need to turn on this when user activation is implemented
    if (!user.isActive) {
      throw new BadRequestException('Your account is not activated. Please check your email for the activation link.');
    }
    return user;
  }
}
