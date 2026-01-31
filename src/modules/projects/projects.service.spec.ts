import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockProjectModel: any;

  beforeEach(() => {
    // Create constructor mock
    mockProjectModel = vi.fn().mockImplementation((data) => ({
      ...data,
      _id: 'new-id',
      save: vi.fn().mockResolvedValue({ _id: 'new-id', ...data }),
    }));

    // Add static methods
    mockProjectModel.find = vi.fn();
    mockProjectModel.findById = vi.fn();
    mockProjectModel.findByIdAndUpdate = vi.fn();
    mockProjectModel.findByIdAndDelete = vi.fn();
    mockProjectModel.aggregate = vi.fn();

    service = new ProjectsService(mockProjectModel);
  });

  describe('findAll', () => {
    it('should return all active projects', async () => {
      const mockProjects = [{ _id: '1', title: 'Project 1', active: true }];

      const execMock = vi.fn().mockResolvedValue(mockProjects);
      const sortMock = vi.fn(() => ({ exec: execMock }));
      mockProjectModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findAll();

      expect(result).toEqual(mockProjects);
      expect(mockProjectModel.find).toHaveBeenCalledWith({ active: true });
    });

    it('should filter by category', async () => {
      const mockProjects = [{ _id: '1', title: 'Project 1', category: 'web', active: true }];

      const execMock = vi.fn().mockResolvedValue(mockProjects);
      const sortMock = vi.fn(() => ({ exec: execMock }));
      mockProjectModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findAll('web');

      expect(mockProjectModel.find).toHaveBeenCalledWith({
        active: true,
        category: { $eq: 'web' },
      });
      expect(result).toEqual(mockProjects);
    });

    it('should filter by featured', async () => {
      const mockProjects = [{ _id: '1', title: 'Project 1', featured: true, active: true }];

      const execMock = vi.fn().mockResolvedValue(mockProjects);
      const sortMock = vi.fn(() => ({ exec: execMock }));
      mockProjectModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findAll(undefined, true);

      expect(mockProjectModel.find).toHaveBeenCalledWith({
        active: true,
        featured: true,
      });
      expect(result).toEqual(mockProjects);
    });
  });

  describe('findAllForAdmin', () => {
    it('should return all projects including inactive', async () => {
      const mockProjects = [
        { _id: '1', title: 'Project 1', active: true },
        { _id: '2', title: 'Project 2', active: false },
      ];

      const execMock = vi.fn().mockResolvedValue(mockProjects);
      const sortMock = vi.fn(() => ({ exec: execMock }));
      mockProjectModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findAllForAdmin();

      expect(result).toEqual(mockProjects);
      expect(mockProjectModel.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      const mockProject = { _id: '1', title: 'Test' };

      const execMock = vi.fn().mockResolvedValue(mockProject);
      mockProjectModel.findById.mockReturnValue({ exec: execMock });

      const result = await service.findOne('1');

      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      const execMock = vi.fn().mockResolvedValue(null);
      mockProjectModel.findById.mockReturnValue({ exec: execMock });

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createDto = { title: 'New Project', description: 'Test' };

      const result = await service.create(createDto as any);

      expect(result).toBeDefined();
      expect(result).toMatchObject({ _id: 'new-id', ...createDto });
      expect(mockProjectModel).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { title: 'Updated' };
      const updatedProject = { _id: '1', ...updateDto };

      const execMock = vi.fn().mockResolvedValue(updatedProject);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedProject);
    });

    it('should throw NotFoundException if project not found on update', async () => {
      const execMock = vi.fn().mockResolvedValue(null);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      await expect(service.update('999', { title: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should update project with technologies array', async () => {
      const updateDto = { technologies: ['Vue', 'Node.js'] };
      const updatedProject = { _id: '1', ...updateDto };

      const execMock = vi.fn().mockResolvedValue(updatedProject);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedProject);
      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { technologies: ['Vue', 'Node.js'] },
        { new: true },
      );
    });

    it('should filter out non-allowed fields', async () => {
      const updateDto = { title: 'Updated', notAllowed: 'value', $operator: 'hack' };
      const updatedProject = { _id: '1', title: 'Updated' };

      const execMock = vi.fn().mockResolvedValue(updatedProject);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto as any);

      expect(result).toEqual(updatedProject);
      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      const execMock = vi.fn().mockResolvedValue({ _id: '1' });
      mockProjectModel.findByIdAndDelete.mockReturnValue({ exec: execMock });

      await service.remove('1');

      expect(mockProjectModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(execMock).toHaveBeenCalled();
    });

    it('should throw NotFoundException if project not found on delete', async () => {
      const execMock = vi.fn().mockResolvedValue(null);
      mockProjectModel.findByIdAndDelete.mockReturnValue({ exec: execMock });

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return statistics with total and by category', async () => {
      const mockProjects = [
        { _id: '1', title: 'Project 1', category: 'web', active: true },
        { _id: '2', title: 'Project 2', category: 'web', active: true },
        { _id: '3', title: 'Project 3', category: 'mobile', active: true },
      ];

      const execMock = vi.fn().mockResolvedValue(mockProjects);
      mockProjectModel.find.mockReturnValue({ exec: execMock });

      const result = await service.getStats();

      expect(result).toEqual({
        total: 3,
        byCategory: { web: 2, mobile: 1 },
      });
      expect(mockProjectModel.find).toHaveBeenCalledWith({ active: true });
    });
  });

  describe('findAll edge cases', () => {
    it('should ignore category filter when set to "all"', async () => {
      const mockProjects = [{ _id: '1', title: 'Project 1', active: true }];

      const execMock = vi.fn().mockResolvedValue(mockProjects);
      const sortMock = vi.fn(() => ({ exec: execMock }));
      mockProjectModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findAll('all');

      expect(mockProjectModel.find).toHaveBeenCalledWith({ active: true });
      expect(result).toEqual(mockProjects);
    });

    it('should filter by both category and featured', async () => {
      const mockProjects = [
        { _id: '1', title: 'Project 1', category: 'web', featured: true, active: true },
      ];

      const execMock = vi.fn().mockResolvedValue(mockProjects);
      const sortMock = vi.fn(() => ({ exec: execMock }));
      mockProjectModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findAll('web', true);

      expect(mockProjectModel.find).toHaveBeenCalledWith({
        active: true,
        category: { $eq: 'web' },
        featured: true,
      });
      expect(result).toEqual(mockProjects);
    });
  });

  describe('update - edge cases', () => {
    it('should handle null values in update fields', async () => {
      const updateDto = { description: null };
      const updatedProject = { _id: '1', description: null };

      const execMock = vi.fn().mockResolvedValue(updatedProject);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto as any);

      expect(result).toEqual(updatedProject);
      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { description: null },
        { new: true },
      );
    });

    it('should reject nested objects in update', async () => {
      const updateDto = { title: 'Test', metadata: { nested: 'value' } };
      const updatedProject = { _id: '1', title: 'Test' };

      const execMock = vi.fn().mockResolvedValue(updatedProject);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto as any);

      // metadata should be filtered out as it's a nested object
      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Test' },
        { new: true },
      );
    });

    it('should reject technologies array with non-string values', async () => {
      const updateDto = { technologies: ['Vue', 123, 'Node'] };
      const updatedProject = { _id: '1' };

      const execMock = vi.fn().mockResolvedValue(updatedProject);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto as any);

      // technologies should be filtered out as it contains non-string values
      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith('1', {}, { new: true });
    });

    it('should accept valid technologies array with only strings', async () => {
      const updateDto = { technologies: ['Vue', 'Node', 'TypeScript'] };
      const updatedProject = { _id: '1', technologies: ['Vue', 'Node', 'TypeScript'] };

      const execMock = vi.fn().mockResolvedValue(updatedProject);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto);

      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { technologies: ['Vue', 'Node', 'TypeScript'] },
        { new: true },
      );
    });

    it('should filter out fields with nested mongo operators', async () => {
      const updateDto = {
        title: 'Test',
        malicious: { $set: { admin: true } },
      };
      const updatedProject = { _id: '1', title: 'Test' };

      const execMock = vi.fn().mockResolvedValue(updatedProject);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto as any);

      // malicious field should be filtered out
      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Test' },
        { new: true },
      );
    });

    it('should handle number values correctly', async () => {
      const updateDto = { order: 5 };
      const updatedProject = { _id: '1', order: 5 };

      const execMock = vi.fn().mockResolvedValue(updatedProject);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto as any);

      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { order: 5 },
        { new: true },
      );
    });

    it('should handle boolean values correctly', async () => {
      const updateDto = { active: false };
      const updatedProject = { _id: '1', active: false };

      const execMock = vi.fn().mockResolvedValue(updatedProject);
      mockProjectModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      const result = await service.update('1', updateDto as any);

      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { active: false },
        { new: true },
      );
    });
  });
});
