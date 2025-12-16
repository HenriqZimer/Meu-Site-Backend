import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {}

  async findAll(year?: string): Promise<Course[]> {
    const filter: any = { active: true };

    if (year) {
      filter.year = { $eq: year };
    }

    return this.courseModel.find(filter).sort({ year: -1, order: 1, name: 1 }).exec();
  }

  async findAllForAdmin(): Promise<Course[]> {
    return this.courseModel.find().sort({ year: -1, order: 1, name: 1 }).exec();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async getYears(): Promise<string[]> {
    const years = await this.courseModel.distinct('year').exec();
    return years.sort().reverse();
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = new this.courseModel(createCourseDto);
    return course.save();
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    // Only allow whitelisted fields from UpdateCourseDto for updating
    const allowedFields = ['name', 'year', 'order', 'active']; // Update to allowed UpdateCourseDto fields
    const safeUpdate: any = {};
    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(updateCourseDto, field) &&
        typeof (updateCourseDto as any)[field] !== 'undefined'
      ) {
        safeUpdate[field] = (updateCourseDto as any)[field];
      }
    }

    const course = await this.courseModel
      .findByIdAndUpdate(id, { $set: safeUpdate }, { new: true })
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}
