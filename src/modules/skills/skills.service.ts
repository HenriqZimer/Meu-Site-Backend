import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill } from './schemas/skill.schema';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(@InjectModel(Skill.name) private skillModel: Model<Skill>) {}

  async findAll(): Promise<Skill[]> {
    return this.skillModel.find({ active: true }).sort({ order: 1, name: 1 }).exec();
  }

  async findAllForAdmin(): Promise<Skill[]> {
    return this.skillModel.find().sort({ order: 1, name: 1 }).exec();
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillModel.findById(id).exec();
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async findByCategory(category: string): Promise<Skill[]> {
    return this.skillModel
      .find({ category: { $eq: category }, active: true })
      .sort({ order: 1, name: 1 })
      .exec();
  }

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    const skill = new this.skillModel(createSkillDto);
    return skill.save();
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    // Only allow updating specific fields
    const allowedFields = ['name', 'category', 'icon', 'color', 'bgColor', 'order', 'active'];
    const safeUpdate: Partial<UpdateSkillDto> = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateSkillDto, key)) {
        (safeUpdate as any)[key] = (updateSkillDto as any)[key];
      }
    }
    const skill = await this.skillModel
      .findByIdAndUpdate(id, { $set: safeUpdate }, { new: true })
      .exec();

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async remove(id: string): Promise<void> {
    const result = await this.skillModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
  }
}
