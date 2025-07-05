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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailerService: MailerService,
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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email })
  }

  async findByCodeID(codeID: string) {
    return await this.userModel.findOne({ codeID })
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
    this.mailerService.sendMail({
      to: User.email, // list of receivers
      subject: 'Activate account ', // Subject line
      template: 'register',
      context: {
        name: User?.name ?? User.email,
        activationCode: C_ID
      }
    })
    return {
      _id: User._id,
    }
  }
}