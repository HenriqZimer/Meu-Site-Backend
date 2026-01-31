import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, type: String })
  username: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ default: 'admin', type: String })
  role: string;

  @Prop({ default: true, type: Boolean })
  active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
