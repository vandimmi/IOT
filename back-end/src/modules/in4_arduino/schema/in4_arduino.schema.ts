
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type in4_arduinoDocument = HydratedDocument<in4_arduino>;

@Schema({timestamps: true})
export class in4_arduino {
    @Prop()
        mq2: number;

    @Prop()
        mq7: number;

    @Prop()
        mq135: number;

    @Prop()
        temperature: number;

    @Prop()
        waterVolunme: number;

    @Prop()
        fire: boolean;
}

export const in4_arduinoSchema = SchemaFactory.createForClass(in4_arduino);
