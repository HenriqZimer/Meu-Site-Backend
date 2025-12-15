import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProject = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Project',
    description: 'Test Description',
    technologies: ['Node.js', 'Vue.js'],
    url: 'https://test.com',
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

    controller = new ProjectsController(service);
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      const projects = [mockProject];
      vi.spyOn(service, 'findAll').mockResolvedValue(projects as any);

      const result = await controller.findAll();

      expect(result).toEqual(projects);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return project statistics', async () => {
      const stats = { total: 10, active: 8 };
      vi.spyOn(service, 'getStats').mockResolvedValue(stats);

      const result = await controller.getStats();

      expect(result).toEqual(stats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockProject as any);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockProject);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
