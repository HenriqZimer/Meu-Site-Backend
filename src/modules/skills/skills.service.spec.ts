import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillsService } from './skills.service';
import { NotFoundException } from '@nestjs/common';

describe('SkillsService', () => {
  let service: SkillsService;
  let mockSkillModel: any;
  let mockExec: any;
  let mockSort: any;

  beforeEach(() => {
    mockExec = vi.fn();
    mockSort = vi.fn(() => ({ exec: mockExec }));
    const mockFind = vi.fn(() => ({ sort: mockSort }));

    const MockModel = vi.fn((data: any) => ({
      ...data,
      save: vi.fn().mockResolvedValue({ _id: '1', ...data }),
    }));

    mockSkillModel = MockModel as any;
    mockSkillModel.find = mockFind;
    mockSkillModel.findById = vi.fn(() => ({ exec: mockExec }));
    mockSkillModel.findByIdAndUpdate = vi.fn(() => ({ exec: mockExec }));
    mockSkillModel.findByIdAndDelete = vi.fn(() => ({ exec: mockExec }));

    service = new SkillsService(mockSkillModel as any);
  });

  describe('findAll', () => {
    it('should return all active skills sorted by order and name', async () => {
      const mockSkills = [
        { _id: '1', name: 'Docker', category: 'DevOps', active: true, order: 1 },
        { _id: '2', name: 'Kubernetes', category: 'DevOps', active: true, order: 2 },
      ];

      mockExec.mockResolvedValue(mockSkills);

      const result = await service.findAll();

      expect(result).toEqual(mockSkills);
      expect(mockSkillModel.find).toHaveBeenCalledWith({ active: true });
      expect(mockSort).toHaveBeenCalledWith({ order: 1, name: 1 });
    });
  });

  describe('findAllForAdmin', () => {
    it('should return all skills including inactive ones', async () => {
      const mockSkills = [
        { _id: '1', name: 'Docker', active: true },
        { _id: '2', name: 'Old Tech', active: false },
      ];

      const mockExec = vi.fn().mockResolvedValue(mockSkills);
      const mockSort = vi.fn(() => ({ exec: mockExec }));
      mockSkillModel.find.mockReturnValue({ sort: mockSort });

      const result = await service.findAllForAdmin();

      expect(result).toEqual(mockSkills);
      expect(mockSkillModel.find).toHaveBeenCalledWith();
      expect(mockSort).toHaveBeenCalledWith({ order: 1, name: 1 });
    });
  });

  describe('findOne', () => {
    it('should return a skill by id', async () => {
      const mockSkill = { _id: '1', name: 'Docker', category: 'DevOps' };

      const mockExec = vi.fn().mockResolvedValue(mockSkill);
      mockSkillModel.findById.mockReturnValue({ exec: mockExec });

      const result = await service.findOne('1');

      expect(result).toEqual(mockSkill);
      expect(mockSkillModel.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when skill not found', async () => {
      const mockExec = vi.fn().mockResolvedValue(null);
      mockSkillModel.findById.mockReturnValue({ exec: mockExec });

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'Skill with ID invalid-id not found',
      );
    });
  });

  describe('findByCategory', () => {
    it('should return skills filtered by category', async () => {
      const mockSkills = [
        { _id: '1', name: 'Docker', category: 'DevOps', active: true },
        { _id: '2', name: 'Kubernetes', category: 'DevOps', active: true },
      ];

      const mockExec = vi.fn().mockResolvedValue(mockSkills);
      const mockSort = vi.fn(() => ({ exec: mockExec }));
      mockSkillModel.find.mockReturnValue({ sort: mockSort });

      const result = await service.findByCategory('DevOps');

      expect(result).toEqual(mockSkills);
      expect(mockSkillModel.find).toHaveBeenCalledWith({
        category: { $eq: 'DevOps' },
        active: true,
      });
      expect(mockSort).toHaveBeenCalledWith({ order: 1, name: 1 });
    });
  });

  describe('create', () => {
    it('should create a new skill', async () => {
      const createDto = {
        name: 'Docker',
        category: 'DevOps',
        icon: 'mdi-docker',
        color: '#2496ED',
      };

      const result = await service.create(createDto);

      expect(result._id).toBe('1');
      expect(mockSkillModel).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a skill with allowed fields only', async () => {
      const updateDto = {
        name: 'Docker Updated',
        category: 'DevOps',
        active: true,
      };

      const mockSkill = { _id: '1', ...updateDto };
      const mockExec = vi.fn().mockResolvedValue(mockSkill);
      mockSkillModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockSkill);
      expect(mockSkillModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { $set: updateDto },
        { new: true },
      );
    });

    it('should throw NotFoundException when skill not found', async () => {
      const mockExec = vi.fn().mockResolvedValue(null);
      mockSkillModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

      await expect(service.update('invalid-id', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should filter out non-allowed fields', async () => {
      const updateDto = {
        name: 'Docker',
        notAllowedField: 'should be ignored',
      } as any;

      const mockSkill = { _id: '1', name: 'Docker' };
      const mockExec = vi.fn().mockResolvedValue(mockSkill);
      mockSkillModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

      await service.update('1', updateDto);

      expect(mockSkillModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { $set: { name: 'Docker' } },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a skill', async () => {
      const mockSkill = { _id: '1', name: 'Docker' };
      const mockExec = vi.fn().mockResolvedValue(mockSkill);
      mockSkillModel.findByIdAndDelete.mockReturnValue({ exec: mockExec });

      await service.remove('1');

      expect(mockSkillModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when skill not found', async () => {
      const mockExec = vi.fn().mockResolvedValue(null);
      mockSkillModel.findByIdAndDelete.mockReturnValue({ exec: mockExec });

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
      await expect(service.remove('invalid-id')).rejects.toThrow(
        'Skill with ID invalid-id not found',
      );
    });
  });
});
