import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CertificationsService } from './certifications.service';

describe('CertificationsService', () => {
  let service: CertificationsService;
  let mockCertificationModel: any;

  beforeEach(() => {
    // Create constructor mock
    mockCertificationModel = vi.fn().mockImplementation((data) => ({
      ...data,
      _id: 'new-id',
      save: vi.fn().mockResolvedValue({ _id: 'new-id', ...data }),
    }));

    // Add static methods
    mockCertificationModel.find = vi.fn();
    mockCertificationModel.findById = vi.fn();
    mockCertificationModel.findByIdAndUpdate = vi.fn();
    mockCertificationModel.findByIdAndDelete = vi.fn();
    mockCertificationModel.aggregate = vi.fn();

    service = new CertificationsService(mockCertificationModel);
  });

  describe('findAll', () => {
    it('should return all active certifications', async () => {
      const mockCertifications = [
        { _id: '1', name: 'AWS Certified', provider: 'AWS', active: true },
      ];

      const execMock = vi.fn().mockResolvedValue(mockCertifications);
      const sortMock = vi.fn(() => ({ exec: execMock }));
      mockCertificationModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findAll();

      expect(result).toEqual(mockCertifications);
      expect(mockCertificationModel.find).toHaveBeenCalledWith({ active: true });
    });
  });

  describe('findAllForAdmin', () => {
    it('should return all certifications including inactive', async () => {
      const mockCertifications = [
        { _id: '1', name: 'Cert 1', active: true },
        { _id: '2', name: 'Cert 2', active: false },
      ];

      const execMock = vi.fn().mockResolvedValue(mockCertifications);
      const sortMock = vi.fn(() => ({ exec: execMock }));
      mockCertificationModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findAllForAdmin();

      expect(result).toEqual(mockCertifications);
      expect(mockCertificationModel.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a certification by id', async () => {
      const mockCertification = { _id: '1', name: 'Test' };

      const execMock = vi.fn().mockResolvedValue(mockCertification);
      mockCertificationModel.findById.mockReturnValue({ exec: execMock });

      const result = await service.findOne('1');

      expect(result).toEqual(mockCertification);
    });

    it('should throw NotFoundException if certification not found', async () => {
      const execMock = vi.fn().mockResolvedValue(null);
      mockCertificationModel.findById.mockReturnValue({ exec: execMock });

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIssuer', () => {
    it('should return certifications by issuer', async () => {
      const mockCertifications = [{ _id: '1', issuer: 'AWS', active: true }];

      const execMock = vi.fn().mockResolvedValue(mockCertifications);
      const sortMock = vi.fn(() => ({ exec: execMock }));
      mockCertificationModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findByIssuer('AWS');

      expect(result).toEqual(mockCertifications);
      expect(mockCertificationModel.find).toHaveBeenCalledWith({
        issuer: { $eq: 'AWS' },
        active: true,
      });
    });
  });

  describe('create', () => {
    it('should create a new certification', async () => {
      const createDto = { name: 'New Cert', issuer: 'AWS' };

      const result = await service.create(createDto as any);

      expect(result).toBeDefined();
      expect(result).toMatchObject({ _id: 'new-id', ...createDto });
      expect(mockCertificationModel).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a certification', async () => {
      const updateDto = { name: 'Updated' };
      const updatedCert = { _id: '1', ...updateDto };

      const execMock = vi.fn().mockResolvedValue(updatedCert);
      mockCertificationModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedCert);
    });

    it('should throw NotFoundException if certification not found on update', async () => {
      const execMock = vi.fn().mockResolvedValue(null);
      mockCertificationModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      await expect(service.update('999', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a certification', async () => {
      const execMock = vi.fn().mockResolvedValue({ _id: '1' });
      mockCertificationModel.findByIdAndDelete.mockReturnValue({ exec: execMock });

      await service.remove('1');

      expect(mockCertificationModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(execMock).toHaveBeenCalled();
    });

    it('should throw NotFoundException if certification not found on delete', async () => {
      const execMock = vi.fn().mockResolvedValue(null);
      mockCertificationModel.findByIdAndDelete.mockReturnValue({ exec: execMock });

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
