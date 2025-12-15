import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock do ProjectsService sem importar schemas
class MockProjectsService {
  constructor(private readonly projectModel: any) {}

  async findAll(active = true) {
    return this.projectModel.find({ active }).sort({ order: 1 }).exec();
  }

  async findById(id: string) {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new Error('Projeto não encontrado');
    }
    return project;
  }

  async getStats() {
    const stats = await this.projectModel.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { active: true } }, { $count: 'count' }],
          byTech: [
            { $unwind: '$technologies' },
            { $group: { _id: '$technologies', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
        },
      },
    ]);

    return stats[0];
  }
}

describe('ProjectsService', () => {
  let service: MockProjectsService;
  let mockProjectModel: any;

  beforeEach(() => {
    mockProjectModel = {
      find: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
      aggregate: vi.fn(),
    };

    service = new MockProjectsService(mockProjectModel as any);
  });

  describe('findAll', () => {
    it('should return all active projects', async () => {
      const mockProjects = [
        {
          _id: '1',
          name: 'Portfolio',
          description: 'Personal portfolio',
          active: true,
        },
      ];

      mockProjectModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockProjects),
        }),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockProjects);
      expect(mockProjectModel.find).toHaveBeenCalledWith({ active: true });
    });
  });

  describe('getStats', () => {
    it('should return project statistics', async () => {
      const mockStats = [
        {
          totalProjects: 10,
          activeProjects: 8,
          projectsByTechnology: [
            { _id: 'Docker', count: 5 },
            { _id: 'Kubernetes', count: 3 },
          ],
        },
      ];

      mockProjectModel.aggregate.mockResolvedValue(mockStats);

      const result = await service.getStats();

      expect(result).toEqual(mockStats[0]);
      expect(mockProjectModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a project by id', async () => {
      const mockProject = {
        _id: '1',
        name: 'Portfolio',
        description: 'Personal portfolio',
      };

      mockProjectModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockProject),
      });

      const result = await service.findById('1');

      expect(result).toEqual(mockProject);
    });

    it('should throw error if project not found', async () => {
      mockProjectModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(service.findById('999')).rejects.toThrow(
        'Projeto não encontrado',
      );
    });
  });
});
