import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Certification } from './schemas/certification.schema';
import { CreateCertificationDto, UpdateCertificationDto } from './dto/certification.dto';

@Injectable()
export class CertificationsService {
  constructor(@InjectModel(Certification.name) private certificationModel: Model<Certification>) {}

  async findAll(): Promise<Certification[]> {
    return this.certificationModel.find({ active: true }).sort({ order: 1, date: -1 }).exec();
  }

  async findAllForAdmin(): Promise<Certification[]> {
    return this.certificationModel.find().sort({ order: 1, date: -1 }).exec();
  }

  async findOne(id: string): Promise<Certification> {
    const certification = await this.certificationModel.findById(id).exec();
    if (!certification) {
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }
    return certification;
  }

  async findByIssuer(issuer: string): Promise<Certification[]> {
    return this.certificationModel
      .find({ issuer: { $eq: issuer }, active: true })
      .sort({ order: 1, date: -1 })
      .exec();
  }

  async create(createCertificationDto: CreateCertificationDto): Promise<Certification> {
    const certification = new this.certificationModel(createCertificationDto);
    return certification.save();
  }

  async update(id: string, updateCertificationDto: UpdateCertificationDto): Promise<Certification> {
    // List of allowed fields for update
    const allowedFields = [
      'name',
      'issuer',
      'date',
      'order',
      'active',
      // add other allowed field names from the Certification schema
    ];
    // Sanitize updateCertificationDto: only allow allowedFields
    const safeUpdate: Partial<UpdateCertificationDto> = {};
    for (const key of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(updateCertificationDto, key) &&
        // Avoid accidental update operator injection by explicitly blocking '$'-prefixed keys
        !key.startsWith('$')
      ) {
        const value = updateCertificationDto[key];
        // Only assign if value is strictly a safe primitive or a valid Date instance.
        // Completely reject objects and arrays to prevent NoSQL injection.
        if (
          value === null ||
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          (value instanceof Date && !isNaN(value.valueOf()))
        ) {
          safeUpdate[key] = value;
        }
        // else: Skip/ignore unsafe types (objects, arrays, functions)
      }
    }
    const certification = await this.certificationModel
      .findByIdAndUpdate(id, safeUpdate, { new: true })
      .exec();

    if (!certification) {
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }
    return certification;
  }

  async remove(id: string): Promise<void> {
    const result = await this.certificationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }
  }

  async getStats(): Promise<{ total: number; byIssuer: Record<string, number> }> {
    const certifications = await this.certificationModel.find({ active: true }).exec();
    const total = certifications.length;

    const byIssuer = certifications.reduce(
      (acc, cert) => {
        acc[cert.issuer] = (acc[cert.issuer] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, byIssuer };
  }
}
