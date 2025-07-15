import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TelegramUserDocument = TelegramUser & Document;

@Schema()
export class TelegramUser {
  @Prop({ required: true, unique: true })
  telegram_chat_id: string;

  @Prop()
  username: string;

  @Prop()
  first_name: string;

  @Prop({ default: Date.now })
  linked_time: Date;
}

export const TelegramUserSchema = SchemaFactory.createForClass(TelegramUser);
