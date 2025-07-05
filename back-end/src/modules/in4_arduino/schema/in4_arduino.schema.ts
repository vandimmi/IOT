
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type in4_arduinoDocument = HydratedDocument<in4_arduino>;

@Schema({timestamps: true})
export class in4_arduino {
    @Prop()
        heat: number;

    @Prop()
        humidity: number;

    @Prop()
        gas: number;

}

export const in4_arduinoSchema = SchemaFactory.createForClass(in4_arduino);
