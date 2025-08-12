import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPassword } from 'src/helper/util';
import { isEmail } from 'class-validator';
import aqp from 'api-query-params';
import { skip } from 'node:test';
import mongoose from 'mongoose';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailerService: MailerService,
    private telegramService: TelegramService,
  ) { }

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    return user ? true : false;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, username, password } = createUserDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await this.userModel.create({
      name,
      email,
      username,
      password: hashedPassword,
    });
    return {
      _id: newUser._id,
    };
  }

  async findAll(query: string, current: number = 1, pageSize: number = 10) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip((current - 1) * pageSize)
      .select('-password')
      .sort(sort as any) // need to know what type/command can be used
    return { results, totalItems, totalPages, current, pageSize };
  }

  findOne(id: string) {
    if (mongoose.isValidObjectId(id)) {
      return this.userModel.findById(id).select('-password');
    } else if (isEmail(id)) {
      return this.userModel.findOne({ email: id }).select('-password');
    } else {
      throw new BadRequestException('Invalid user ID or email');
    }
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email })
  }

  async findByCodeID(codeID: string) {
    return await this.userModel.findOne({ codeID });
  }

  async findin4Email(email: string) {
    if (isEmail(email)) {
      return await this.userModel.findOne({ email }).select('-password');
    } else {
      throw new BadRequestException('Invalid email format');
    }
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        $set: {
          name: updateUserDto.name,
          email: updateUserDto.email,
          age: updateUserDto.age,
        },
      },
    )
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return await this.userModel.deleteOne({ _id });
    }
    else {
      throw new BadRequestException('Invalid user ID');
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, password, email } = registerDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await hashPassword(password);
    const C_ID = uuidv4();
    const User = await this.userModel.create({
      name,
      password: hashedPassword,
      email,
      isActives: false,
      codeID: C_ID,
      codeExpire: dayjs().add(5, 'minutes').toDate(),
    })
    try {
      await this.mailerService.sendMail({
        to: User.email, // list of receivers
        subject: 'Activate account ', // Subject line
        template: 'register',
        context: {
          name: User?.name ?? User.email,
          activationCode: C_ID
        }
      })
    }
    catch (err) {
      console.error("Error sending email", err);
    }
    return {
      _id: User._id,
    }
  }

  async sendFireAlertEmail(
  email: string,
  sensorData: {
    mq2: number;
    mq7: number;
    mq135: number;
    temperature: number;
    flame: number;
  },
  thresholds: {
    MQ2: number;
    MQ7: number;
    MQ135: number;
    temp: number;
  }
) {
  try {
    const flameAlert = sensorData.flame === 0; // flame=0 => có lửa
    const tempAlert = sensorData.temperature > thresholds.temp;
    const mq2Alert = sensorData.mq2 > thresholds.MQ2;
    const mq7Alert = sensorData.mq7 > thresholds.MQ7;
    const mq135Alert = sensorData.mq135 > thresholds.MQ135;

    await this.mailerService.sendMail({
      to: email,
      subject: '🔥 FireGuard - Cảnh báo cháy',
      template: 'fired', // tên template file fire-alert.hbs (hoặc .html nếu bạn config đúng)
      context: {
        email,
        mq2: sensorData.mq2,
        mq7: sensorData.mq7,
        mq135: sensorData.mq135,
        temp: sensorData.temperature,
        fired: flameAlert ? 'Có' : 'Không',
        thresholds,
        flameAlert,
        tempAlert,
        mq2Alert,
        mq7Alert,
        mq135Alert,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Lỗi gửi email cảnh báo cháy:', error);
    throw error;
  }
}


  async notifyUser(email: string, content: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || !user.chat_id) {
      throw new Error('User không có chatId');
    }

    await this.telegramService.sendMessage(user.chat_id, content);
  }
}