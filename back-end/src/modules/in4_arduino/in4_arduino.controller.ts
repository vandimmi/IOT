import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { In4ArduinoService } from './in4_arduino.service';
import { CreateIn4ArduinoDto } from './dto/create-in4_arduino.dto';
import { UpdateIn4ArduinoDto } from './dto/update-in4_arduino.dto';

@Controller('in4-arduino')
export class In4ArduinoController {
  constructor(private readonly in4ArduinoService: In4ArduinoService) {}

  @Post()
  create(@Body() createIn4ArduinoDto: CreateIn4ArduinoDto) {
    return this.in4ArduinoService.create(createIn4ArduinoDto);
  }

  @Get()
  findAll() {
    return this.in4ArduinoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.in4ArduinoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIn4ArduinoDto: UpdateIn4ArduinoDto) {
    return this.in4ArduinoService.update(+id, updateIn4ArduinoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.in4ArduinoService.remove(+id);
  }
}
