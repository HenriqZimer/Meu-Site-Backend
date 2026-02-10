import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<Project>) {}

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

    return this.projectModel.find(filter).sort({ projectDate: -1, createdAt: -1 }).exec();
  }

  async findAllForAdmin(): Promise<Project[]> {
    return this.projectModel.find().sort({ projectDate: -1, createdAt: -1 }).exec();
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

  // Helper: recursively verify that an update object does not contain MongoDB operators
  // and only contains safe primitives or arrays of strings (for technologies).
  private isSafeUpdateObject(obj: any): boolean {
    if (obj === null || obj === undefined) {
      return true;
    }

    if (this.isSafePrimitive(obj)) {
      return true;
    }

    if (Array.isArray(obj)) {
      // We only expect arrays of primitive values (e.g., technologies: string[])
      return obj.every((item) => this.isSafePrimitive(item));
    }

    if (typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        // Disallow any MongoDB operator keys anywhere in the object graph
        if (key.startsWith('$')) {
          return false;
        }
        if (!this.isSafeUpdateObject(obj[key])) {
          return false;
        }
      }
      return true;
    }

    // Any other types are considered unsafe
    return false;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    // Whitelist of allowed update fields -- update as appropriate
    const allowedFields = [
      'title',
      'description',
      'image',
      'category',
      'technologies',
      'demoUrl',
      'githubUrl',
      'order',
      'active',
    ];
    const sanitizedUpdate: any = {};

    for (const key of Object.keys(updateProjectDto)) {
      if (key.startsWith('$')) {
        // Disallow MongoDB operators at the top level
        continue;
      }
      if (allowedFields.includes(key)) {
        const value = updateProjectDto[key];
        // Special handling for technologies array
        if (key === 'technologies' && Array.isArray(value)) {
          // Validate that all elements are strings
          if (value.every((item) => typeof item === 'string')) {
            sanitizedUpdate[key] = value;
          }
        }
        // Only allow primitive values for other fields
        else if (this.isSafePrimitive(value)) {
          sanitizedUpdate[key] = value;
        }
      }
    // Final defensive validation: ensure no MongoDB operator keys are present
    if (!this.isSafeUpdateObject(sanitizedUpdate)) {
      throw new NotFoundException('Invalid update payload'); // or BadRequestException if imported
    }

    }

    const project = await this.projectModel
      .findByIdAndUpdate(id, { $set: sanitizedUpdate }, { new: true })
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
        acc[project.category] = (acc[project.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, byCategory };
  }
}
