import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Skill extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, required: true })
  icon: string;

  @Prop({ type: String, required: true })
  color: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
