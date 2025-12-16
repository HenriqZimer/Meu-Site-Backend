import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockCourse = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Course',
    platform: 'Test Platform',
    instructor: 'Test Instructor',
    duration: '10h',
    year: '2024',
    order: 1,
    active: true,
  };

  beforeEach(() => {
    service = {
      findAll: vi.fn(),
      getYears: vi.fn(),
      findOne: vi.fn(),
      findAllForAdmin: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    controller = new CoursesController(service);
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      const courses = [mockCourse];
      vi.spyOn(service, 'findAll').mockResolvedValue(courses as any);

      const result = await controller.findAll();

      expect(result).toEqual(courses);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getYears', () => {
    it('should return all distinct years', async () => {
      const years = ['2024', '2023'];
      vi.spyOn(service, 'getYears').mockResolvedValue(years);

      const result = await controller.getYears();

      expect(result).toEqual(years);
      expect(service.getYears).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockCourse as any);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockCourse);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
