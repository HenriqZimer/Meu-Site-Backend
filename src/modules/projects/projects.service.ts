import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<Project>) {}

  async findAll(category?: string, featured?: boolean): Promise<Project[]> {
    const filter: any = { active: true };

    if (category && category !== 'all') {
      if (typeof category === 'string') {
        // Use $eq operator to ensure it is treated as a literal value
        filter.category = { $eq: category };
      }
      // else: ignore non-string values for security; do not add to filter
    }

    if (featured !== undefined) {
      filter.featured = featured;
    }

    return this.projectModel.find(filter).sort({ order: 1, createdAt: -1 }).exec();
  }

  async findAllForAdmin(): Promise<Project[]> {
    return this.projectModel.find().sort({ order: 1, createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = new this.projectModel(createProjectDto);
    return project.save();
  }

  // Helper: returns true only for safe primitives (string, number, boolean, null)
  private isSafePrimitive(value: any): boolean {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    );
  }

  // Helper: recursively reject any object or array value, or keys starting with "$"
  private containsMongoOperator(obj: any): boolean {
    if (Array.isArray(obj)) return true;
    if (obj && typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        if (k.startsWith('$')) return true;
        if (this.containsMongoOperator(obj[k])) return true;
      }
      return false;
    }
    return false;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    // Whitelist of allowed update fields -- update as appropriate
    const allowedFields = ['title', 'description', 'category', 'featured', 'order', 'active']; // Add all valid fields from UpdateProjectDto
    const sanitizedUpdate: any = {};

    for (const key of Object.keys(updateProjectDto)) {
      if (key.startsWith('$')) {
        // Disallow MongoDB operators
        continue;
      }
      if (allowedFields.includes(key)) {
        const value = updateProjectDto[key];
        // Only allow primitive values, not objects or arrays
        if (this.isSafePrimitive(value)) {
          sanitizedUpdate[key] = value;
        }
        // Block any object/array or suspicious value entirely, including nested $ operators
        else if (!this.isSafePrimitive(value) && !this.containsMongoOperator(value)) {
          // skip values that are objects or arrays
          continue;
        }
      }
    }

    const project = await this.projectModel
      .findByIdAndUpdate(id, sanitizedUpdate, { new: true })
      .exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async getStats(): Promise<{ total: number; byCategory: Record<string, number> }> {
    const projects = await this.projectModel.find({ active: true }).exec();
    const total = projects.length;

    const byCategory = projects.reduce(
      (acc, project) => {
        acc[project.category] = (acc[project.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, byCategory };
  }
}
