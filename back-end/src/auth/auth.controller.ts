import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from 'src/customize/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { TelegramService } from 'src/telegram/telegram.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
    private readonly telegramService: TelegramService,
  ) { }

  @Post("login")
  @Public()
  @UseGuards(LocalAuthGuard)
  handleLogin(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @Post("register")
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    console.log("📥 Register DTO:", registerDto);
    return this.authService.handleRegister(registerDto);
  }

  @Get('mail')
  @Public()
  testMail() {
    this.mailerService
      .sendMail({
        to: 'nptho23@clc.fitus.edu.vn', // list of receivers
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        template: 'register',
        context: {
          name: "Nguyen Phuc Tho",
          activationCode: "123456",
        }
      })
      .then(() => { })
      .catch(() => { });
    return "ok";
  }

  @Post('verify')
  @Public()
  async handleVerify(@Body() body: { codeID: string }) {
    const { codeID } = body;
    if (!codeID) {
      throw new BadRequestException('Code ID is required');
    }
    const user = await this.authService.validateCode(codeID);
    if (!user) {
      throw new NotFoundException('User not found or code expired');
    }
    if (user.codeExpire < new Date()) {
      throw new BadRequestException('Code expired');
    }

    user.isActive = true;
    await user.save();

    return {
      message: 'User verified successfully!',
      telegramBotLink: 'https://t.me/FireGuardd_bot',
    };
}

}
