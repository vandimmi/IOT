
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { comparePassword } from 'src/helper/util';
import { access } from 'fs';
import { JwtService } from '@nestjs/jwt';
import { register } from 'module';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await comparePassword(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async login(user: any) {
    const payload = { sub: user._id, email: user.email };
    return {
      access_token: await this.jwtService.sign(payload),
    };
  }

  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto);
  }

  async validateCode(codeID: string) {
    const user = await this.usersService.findByCodeID(codeID);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    return user;
  }
}
