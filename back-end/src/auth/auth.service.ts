
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
  //  console.log("Validating user with email:", email);
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.error("User not found");
      throw new UnauthorizedException("2");
    }

    const isMatch = await comparePassword(pass, user.password);
    if (!isMatch) {
      console.error("Password mismatch");
      throw new UnauthorizedException("3");
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
      console.error("User not found or code expired");
      throw new UnauthorizedException('Invalid or expired code');
    }
    return user;
  }
}
