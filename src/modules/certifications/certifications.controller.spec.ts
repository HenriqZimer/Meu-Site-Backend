import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CertificationsController } from './certifications.controller';
import { CertificationsService } from './certifications.service';

describe('CertificationsController', () => {
  let controller: CertificationsController;
  let service: CertificationsService;

  const mockCertification = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Certification',
    issuer: 'Test Issuer',
    date: 'Jan 2024',
    active: true,
  };

  beforeEach(() => {
    service = {
      findAll: vi.fn(),
      getStats: vi.fn(),
      findOne: vi.fn(),
      findAllForAdmin: vi.fn(),
      findByIssuer: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as any;

    controller = new CertificationsController(service);
  });

  describe('findAll', () => {
    it('should return all certifications', async () => {
      const certifications = [mockCertification];
      vi.spyOn(service, 'findAll').mockResolvedValue(certifications as any);

      const result = await controller.findAll();

      expect(result).toEqual(certifications);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter by issuer when provided', async () => {
      const certifications = [mockCertification];
      vi.spyOn(service, 'findByIssuer').mockResolvedValue(certifications as any);

      const result = await controller.findAll('Test Issuer');

      expect(result).toEqual(certifications);
      expect(service.findByIssuer).toHaveBeenCalledWith('Test Issuer');
    });
  });

  describe('getStats', () => {
    it('should return certification statistics', async () => {
      const stats = { total: 5, active: 4 };
      vi.spyOn(service, 'getStats').mockResolvedValue(stats);

      const result = await controller.getStats();

      expect(result).toEqual(stats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a certification by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockCertification as any);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockCertification);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
  describe('findAllForAdmin', () => {
    it('should return all certifications for admin', async () => {
      const certifications = [mockCertification, { ...mockCertification, active: false }];
      vi.spyOn(service, 'findAllForAdmin').mockResolvedValue(certifications as any);

      const result = await controller.findAllForAdmin();

      expect(result).toEqual(certifications);
      expect(service.findAllForAdmin).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new certification', async () => {
      const createDto = { name: 'New Cert', issuer: 'Issuer', date: 'Jan 2024' };
      vi.spyOn(service, 'create').mockResolvedValue(mockCertification as any);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockCertification);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a certification', async () => {
      const updateDto = { name: 'Updated Cert' };
      const updated = { ...mockCertification, name: 'Updated Cert' };
      vi.spyOn(service, 'update').mockResolvedValue(updated as any);

      const result = await controller.update('507f1f77bcf86cd799439011', updateDto as any);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a certification', async () => {
      vi.spyOn(service, 'remove').mockResolvedValue(mockCertification as any);

      const result = await controller.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockCertification);
      expect(service.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
