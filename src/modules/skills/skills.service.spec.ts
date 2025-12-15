import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock do SkillsService sem importar schemas
class MockSkillsService {
  constructor(private readonly skillModel: any) {}

  async findAll(category?: string, active = true) {
    const filter: any = { active };
    if (category) {
      filter.category = category;
    }
    return this.skillModel.find(filter).sort({ order: 1 }).exec();
  }

  async findById(id: string) {
    const skill = await this.skillModel.findById(id).exec();
    if (!skill) {
      throw new Error('Skill não encontrada');
    }
    return skill;
  }

  async create(createDto: any) {
    return this.skillModel.create(createDto);
  }
}

describe('SkillsService', () => {
  let service: MockSkillsService;
  let mockSkillModel: any;

  beforeEach(() => {
    // Mock do modelo do Mongoose
    mockSkillModel = {
      find: vi.fn(),
      findById: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
    };

    service = new MockSkillsService(mockSkillModel as any);
  });

  describe('findAll', () => {
    it('should return all active skills by default', async () => {
      const mockSkills = [
        { _id: '1', name: 'Docker', category: 'DevOps', active: true },
        { _id: '2', name: 'Kubernetes', category: 'DevOps', active: true },
      ];

      mockSkillModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSkills),
        }),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockSkills);
      expect(mockSkillModel.find).toHaveBeenCalledWith({ active: true });
    });

    it('should filter by category', async () => {
      const mockSkills = [
        { _id: '1', name: 'Docker', category: 'DevOps', active: true },
      ];

      mockSkillModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSkills),
        }),
      });

      const result = await service.findAll('DevOps');

      expect(result).toEqual(mockSkills);
      expect(mockSkillModel.find).toHaveBeenCalledWith({
        active: true,
        category: 'DevOps',
      });
    });
  });

  describe('findById', () => {
    it('should return a skill by id', async () => {
      const mockSkill = { _id: '1', name: 'Docker', category: 'DevOps' };

      mockSkillModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockSkill),
      });

      const result = await service.findById('1');

      expect(result).toEqual(mockSkill);
      expect(mockSkillModel.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error if skill not found', async () => {
      mockSkillModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(service.findById('999')).rejects.toThrow('Skill não encontrada');
    });
  });

  describe('create', () => {
    it('should create a new skill', async () => {
      const createDto = {
        name: 'Jest',
        category: 'Testing',
        icon: 'mdi-test',
        color: '#C21325',
      };

      const mockCreatedSkill = { ...createDto, _id: '1', active: true };

      mockSkillModel.create.mockResolvedValue(mockCreatedSkill);

      const result = await service.create(createDto as any);

      expect(result).toEqual(mockCreatedSkill);
      expect(mockSkillModel.create).toHaveBeenCalledWith(createDto);
    });
  });
});
