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
      remove: vi.fn(),
    } as any;

    controller = new ProjectsController(service);
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      const projects = [mockProject];
      vi.spyOn(service, 'findAll').mockResolvedValue(projects as any);

      const result = await controller.findAll();

      expect(result).toEqual(projects);
      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should filter by category when provided', async () => {
      const projects = [mockProject];
      vi.spyOn(service, 'findAll').mockResolvedValue(projects as any);

      const result = await controller.findAll('web');

      expect(result).toEqual(projects);
      expect(service.findAll).toHaveBeenCalledWith('web', undefined);
    });

    it('should filter by featured when provided', async () => {
      const projects = [mockProject];
      vi.spyOn(service, 'findAll').mockResolvedValue(projects as any);

      const result = await controller.findAll(undefined, true);

      expect(result).toEqual(projects);
      expect(service.findAll).toHaveBeenCalledWith(undefined, true);
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

  describe('findAllForAdmin', () => {
    it('should return all projects for admin', async () => {
      const projects = [mockProject, { ...mockProject, active: false }];
      vi.spyOn(service, 'findAllForAdmin').mockResolvedValue(projects as any);

      const result = await controller.findAllForAdmin();

      expect(result).toEqual(projects);
      expect(service.findAllForAdmin).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createDto = { title: 'New Project', description: 'Description' };
      vi.spyOn(service, 'create').mockResolvedValue(mockProject as any);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockProject);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { title: 'Updated Project' };
      const updated = { ...mockProject, title: 'Updated Project' };
      vi.spyOn(service, 'update').mockResolvedValue(updated as any);

      const result = await controller.update('507f1f77bcf86cd799439011', updateDto as any);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      vi.spyOn(service, 'remove').mockResolvedValue(mockProject as any);

      const result = await controller.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockProject);
      expect(service.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
