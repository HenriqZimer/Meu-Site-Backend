import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Certification extends Document {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  issuer: string;

  @Prop({ required: true, type: String })
  image: string;

  @Prop({ required: true, type: String })
  link: string;

  @Prop({ required: true, type: String })
  date: string;

  @Prop({ required: true, type: Number })
  skills: number;

  @Prop({ default: 0, type: Number })
  order: number;

  @Prop({ default: true, type: Boolean })
  active: boolean;
}

export const CertificationSchema = SchemaFactory.createForClass(Certification);
