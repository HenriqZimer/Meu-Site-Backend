import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

describe('SkillsController', () => {
  let controller: SkillsController;
  let service: SkillsService;

  const mockSkill = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Skill',
    category: 'frontend',
    icon: 'test-icon',
    color: '#000000',
    active: true,
  };

  beforeEach(() => {
    service = {
      findAll: vi.fn(),
      findByCategory: vi.fn(),
      findOne: vi.fn(),
      findAllForAdmin: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    controller = new SkillsController(service);
  });

  describe('findAll', () => {
    it('should return all skills', async () => {
      const skills = [mockSkill];
      vi.spyOn(service, 'findAll').mockResolvedValue(skills as any);

      const result = await controller.findAll();

      expect(result).toEqual(skills);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter by category when provided', async () => {
      const skills = [mockSkill];
      vi.spyOn(service, 'findByCategory').mockResolvedValue(skills as any);

      const result = await controller.findAll('frontend');

      expect(result).toEqual(skills);
      expect(service.findByCategory).toHaveBeenCalledWith('frontend');
    });
  });

  describe('findOne', () => {
    it('should return a skill by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockSkill as any);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockSkill);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
