import { Injectable } from '@nestjs/common';
import { CreateIn4ArduinoDto } from './dto/create-in4_arduino.dto';
import { UpdateIn4ArduinoDto } from './dto/update-in4_arduino.dto';

@Injectable()
export class In4ArduinoService {
  create(createIn4ArduinoDto: CreateIn4ArduinoDto) {
    return 'This action adds a new in4Arduino';
  }

  findAll() {
    return `This action returns all in4Arduino`;
  }

  findOne(id: number) {
    return `This action returns a #${id} in4Arduino`;
  }

  update(id: number, updateIn4ArduinoDto: UpdateIn4ArduinoDto) {
    return `This action updates a #${id} in4Arduino`;
  }

  remove(id: number) {
    return `This action removes a #${id} in4Arduino`;
  }
}
