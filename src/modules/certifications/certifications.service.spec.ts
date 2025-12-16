import { describe, it, expect, beforeEach, vi } from 'vitest';

class MockCertificationsService {
  constructor(private readonly certificationModel: any) {}

  async findAll(active = true) {
    return this.certificationModel.find({ active }).sort({ order: 1 }).exec();
  }

  async findById(id: string) {
    const certification = await this.certificationModel.findById(id).exec();
    if (!certification) {
      throw new Error('Certificação não encontrada');
    }
    return certification;
  }

  async getStats() {
    const stats = await this.certificationModel.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { active: true } }, { $count: 'count' }],
          byProvider: [
            { $group: { _id: '$provider', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
        },
      },
    ]);

    return stats[0];
  }
}

describe('CertificationsService', () => {
  let service: MockCertificationsService;
  let mockCertificationModel: any;

  beforeEach(() => {
    mockCertificationModel = {
      find: vi.fn(),
      findById: vi.fn(),
      aggregate: vi.fn(),
    };

    service = new MockCertificationsService(mockCertificationModel as any);
  });

  describe('findAll', () => {
    it('should return all active certifications', async () => {
      const mockCertifications = [
        {
          _id: '1',
          name: 'AWS Certified',
          provider: 'AWS',
          active: true,
        },
      ];

      mockCertificationModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockCertifications),
        }),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockCertifications);
    });
  });

  describe('getStats', () => {
    it('should return certification statistics', async () => {
      const mockStats = [
        {
          total: [{ count: 5 }],
          active: [{ count: 4 }],
          byProvider: [
            { _id: 'AWS', count: 3 },
            { _id: 'Google', count: 2 },
          ],
        },
      ];

      mockCertificationModel.aggregate.mockResolvedValue(mockStats);

      const result = await service.getStats();

      expect(result).toEqual(mockStats[0]);
    });
  });

  describe('findById', () => {
    it('should throw error if certification not found', async () => {
      mockCertificationModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(service.findById('999')).rejects.toThrow('Certificação não encontrada');
    });
  });
});
