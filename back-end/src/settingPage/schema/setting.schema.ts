import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema()
export class Setting {
  @Prop({ required: true })
  MQ2: number;

  @Prop({ required: true })
  MQ7: number;

  @Prop({ required: true })
  MQ135: number;

  @Prop({ required: true })
  temp: number;

  @Prop()
  wifiSSID: string;

  @Prop()
  wifiPassword: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
