import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  platform: string;

  @Prop({ type: String, required: true })
  instructor: string;

  @Prop({ type: String })
  duration: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: String })
  link: string;

  @Prop({ type: Date })
  date: Date;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
