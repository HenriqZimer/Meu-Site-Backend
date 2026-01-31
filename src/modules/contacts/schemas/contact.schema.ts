import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Contact extends Document {
  @Prop({ type: String, required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ type: String, required: true, trim: true, lowercase: true, maxlength: 100 })
  email: string;

  @Prop({ type: String, required: true, trim: true, maxlength: 200 })
  subject: string;

  @Prop({ type: String, required: true, trim: true, maxlength: 1000 })
  message: string;

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop({ type: Date })
  readAt?: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
