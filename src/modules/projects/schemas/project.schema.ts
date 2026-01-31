import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ type: String })
  image: string;

  @Prop({ required: true, type: String })
  category: string;

  @Prop({ type: [String], required: true })
  technologies: string[];

  @Prop({ type: String })
  demoUrl: string;

  @Prop({ type: String })
  githubUrl: string;

  @Prop({ type: Date })
  projectDate: Date;

  @Prop({ default: true, type: Boolean })
  active: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
