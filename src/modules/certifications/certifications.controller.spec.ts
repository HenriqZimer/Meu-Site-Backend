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
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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
});
