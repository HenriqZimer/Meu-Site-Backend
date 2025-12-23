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
      remove: vi.fn(),
    } as any;

    controller = new CoursesController(service);
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      const courses = [mockCourse];
      vi.spyOn(service, 'findAll').mockResolvedValue(courses as any);

      const result = await controller.findAll();

      expect(result).toEqual(courses);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter by year when provided', async () => {
      const courses = [mockCourse];
      vi.spyOn(service, 'findAll').mockResolvedValue(courses as any);

      const result = await controller.findAll('2024');

      expect(result).toEqual(courses);
      expect(service.findAll).toHaveBeenCalledWith('2024');
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

  describe('findAllForAdmin', () => {
    it('should return all courses for admin', async () => {
      const courses = [mockCourse, { ...mockCourse, active: false }];
      vi.spyOn(service, 'findAllForAdmin').mockResolvedValue(courses as any);

      const result = await controller.findAllForAdmin();

      expect(result).toEqual(courses);
      expect(service.findAllForAdmin).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const createDto = { name: 'New Course', platform: 'Udemy' };
      vi.spyOn(service, 'create').mockResolvedValue(mockCourse as any);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockCourse);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const updateDto = { name: 'Updated Course' };
      const updated = { ...mockCourse, name: 'Updated Course' };
      vi.spyOn(service, 'update').mockResolvedValue(updated as any);

      const result = await controller.update('507f1f77bcf86cd799439011', updateDto as any);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a course', async () => {
      vi.spyOn(service, 'remove').mockResolvedValue(mockCourse as any);

      const result = await controller.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockCourse);
      expect(service.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
