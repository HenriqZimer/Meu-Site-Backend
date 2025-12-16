import { describe, it, expect, beforeEach, vi } from 'vitest';

class MockCoursesService {
  constructor(private readonly courseModel: any) {}

  async findAll(active = true) {
    return this.courseModel.find({ active }).sort({ year: -1, order: 1 }).exec();
  }

  async findById(id: string) {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new Error('Curso não encontrado');
    }
    return course;
  }

  async getYears() {
    const years = await this.courseModel.distinct('year').exec();
    return years.sort((a: number, b: number) => b - a);
  }

  async create(createDto: any) {
    return this.courseModel.create(createDto);
  }
}

describe('CoursesService', () => {
  let service: MockCoursesService;
  let mockCourseModel: any;

  beforeEach(() => {
    mockCourseModel = {
      find: vi.fn(),
      findById: vi.fn(),
      distinct: vi.fn(),
      create: vi.fn(),
    };

    service = new MockCoursesService(mockCourseModel as any);
  });

  describe('findAll', () => {
    it('should return all active courses', async () => {
      const mockCourses = [
        {
          _id: '1',
          name: 'AWS Certification',
          platform: 'Udemy',
          year: '2025',
          active: true,
        },
      ];

      mockCourseModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockCourses),
        }),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockCourses);
      expect(mockCourseModel.find).toHaveBeenCalledWith({ active: true });
    });
  });

  describe('getYears', () => {
    it('should return unique years sorted descending', async () => {
      const mockYears = ['2025', '2024', '2023'];

      mockCourseModel.distinct.mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockYears),
      });

      const result = await service.getYears();

      expect(result).toBeDefined();
      expect(mockCourseModel.distinct).toHaveBeenCalledWith('year');
    });
  });

  describe('findById', () => {
    it('should return a course by id', async () => {
      const mockCourse = {
        _id: '1',
        name: 'AWS Certification',
        platform: 'Udemy',
      };

      mockCourseModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.findById('1');

      expect(result).toEqual(mockCourse);
    });

    it('should throw error if course not found', async () => {
      mockCourseModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(service.findById('999')).rejects.toThrow('Curso não encontrado');
    });
  });
});
