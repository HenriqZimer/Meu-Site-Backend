import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoursesService } from './courses.service';
import { NotFoundException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;
  let mockCourseModel: any;

  beforeEach(() => {
    const mockExec = vi.fn();
    const mockSort = vi.fn(() => ({ exec: mockExec }));
    const mockFind = vi.fn(() => ({ sort: mockSort }));

    const MockModel = vi.fn((data: any) => ({
      ...data,
      save: vi.fn().mockResolvedValue({ _id: '1', ...data }),
    }));

    mockCourseModel = MockModel as any;
    mockCourseModel.find = mockFind;
    mockCourseModel.findById = vi.fn(() => ({ exec: mockExec }));
    mockCourseModel.findByIdAndUpdate = vi.fn(() => ({ exec: mockExec }));
    mockCourseModel.findByIdAndDelete = vi.fn(() => ({ exec: mockExec }));

    service = new CoursesService(mockCourseModel);
  });

  describe('findAll', () => {
    it('should return all active courses sorted by date and name', async () => {
      const mockCourses = [
        {
          _id: '1',
          name: 'AWS Certification',
          platform: 'Udemy',
          date: '2025-01',
          active: true,
        },
      ];

      const mockExec = vi.fn().mockResolvedValue(mockCourses);
      const mockSort = vi.fn(() => ({ exec: mockExec }));
      mockCourseModel.find.mockReturnValue({ sort: mockSort });

      const result = await service.findAll();

      expect(result).toEqual(mockCourses);
      expect(mockCourseModel.find).toHaveBeenCalledWith({ active: true });
      expect(mockSort).toHaveBeenCalledWith({ date: -1, name: 1 });
    });

    it('should filter courses by year', async () => {
      const mockCourses = [{ _id: '1', name: 'Course 2024', date: '2024-06', active: true }];

      const mockExec = vi.fn().mockResolvedValue(mockCourses);
      const mockSort = vi.fn(() => ({ exec: mockExec }));
      mockCourseModel.find.mockReturnValue({ sort: mockSort });

      const result = await service.findAll('2024');

      expect(result).toEqual(mockCourses);
      expect(mockCourseModel.find).toHaveBeenCalledWith({
        active: true,
        date: {
          $gte: new Date('2024-01-01'),
          $lt: new Date('2025-01-01'),
        },
      });
    });
  });

  describe('findAllForAdmin', () => {
    it('should return all courses including inactive ones', async () => {
      const mockCourses = [
        { _id: '1', name: 'Active Course', active: true },
        { _id: '2', name: 'Inactive Course', active: false },
      ];

      const mockExec = vi.fn().mockResolvedValue(mockCourses);
      const mockSort = vi.fn(() => ({ exec: mockExec }));
      mockCourseModel.find.mockReturnValue({ sort: mockSort });

      const result = await service.findAllForAdmin();

      expect(result).toEqual(mockCourses);
      expect(mockCourseModel.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const mockCourse = {
        _id: '1',
        name: 'AWS Certification',
        platform: 'Udemy',
      };

      const mockExec = vi.fn().mockResolvedValue(mockCourse);
      mockCourseModel.findById.mockReturnValue({ exec: mockExec });

      const result = await service.findOne('1');

      expect(result).toEqual(mockCourse);
      expect(mockCourseModel.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when course not found', async () => {
      const mockExec = vi.fn().mockResolvedValue(null);
      mockCourseModel.findById.mockReturnValue({ exec: mockExec });

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'Course with ID invalid-id not found',
      );
    });
  });

  describe('getYears', () => {
    it('should return unique years sorted descending', async () => {
      const mockCourses = [
        { _id: '1', date: '2025-06' },
        { _id: '2', date: '2024-03' },
        { _id: '3', date: '2025-01' },
        { _id: '4', date: '2023-12' },
      ];

      const mockExec = vi.fn().mockResolvedValue(mockCourses);
      const mockSelect = vi.fn(() => ({ exec: mockExec }));
      mockCourseModel.find.mockReturnValue({ select: mockSelect });

      const result = await service.getYears();

      expect(result).toEqual(['2025', '2024', '2023']);
    });

    it('should handle courses without dates', async () => {
      const mockCourses = [
        { _id: '1', date: '2025-06' },
        { _id: '2', date: null },
        { _id: '3', date: '2024-03' },
      ];

      const mockExec = vi.fn().mockResolvedValue(mockCourses);
      const mockSelect = vi.fn(() => ({ exec: mockExec }));
      mockCourseModel.find.mockReturnValue({ select: mockSelect });

      const result = await service.getYears();

      expect(result).toEqual(['2025', '2024']);
    });
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const createDto = {
        name: 'Docker Deep Dive',
        platform: 'Udemy',
        instructor: 'Nigel Poulton',
        duration: '10 hours',
        date: '2025-01',
      };

      const result = await service.create(createDto);

      expect(result._id).toBe('1');
      expect(mockCourseModel).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a course with allowed fields only', async () => {
      const updateDto = {
        name: 'Updated Course',
        platform: 'Coursera',
        active: true,
      };

      const mockCourse = { _id: '1', ...updateDto };
      const mockExec = vi.fn().mockResolvedValue(mockCourse);
      mockCourseModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockCourse);
      expect(mockCourseModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw NotFoundException when course not found', async () => {
      const mockExec = vi.fn().mockResolvedValue(null);
      mockCourseModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

      await expect(service.update('invalid-id', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should filter out non-allowed fields', async () => {
      const updateDto = {
        name: 'Test Course',
        notAllowedField: 'should be ignored',
      } as any;

      const mockCourse = { _id: '1', name: 'Test Course' };
      const mockExec = vi.fn().mockResolvedValue(mockCourse);
      mockCourseModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

      await service.update('1', updateDto);

      const [, update] = mockCourseModel.findByIdAndUpdate.mock.calls[0];
      expect(update.$set).toEqual({ name: 'Test Course' });
      expect(update.$set.notAllowedField).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete a course', async () => {
      const mockCourse = { _id: '1', name: 'Course to delete' };
      const mockExec = vi.fn().mockResolvedValue(mockCourse);
      mockCourseModel.findByIdAndDelete.mockReturnValue({ exec: mockExec });

      await service.remove('1');

      expect(mockCourseModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when course not found', async () => {
      const mockExec = vi.fn().mockResolvedValue(null);
      mockCourseModel.findByIdAndDelete.mockReturnValue({ exec: mockExec });

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
      await expect(service.remove('invalid-id')).rejects.toThrow(
        'Course with ID invalid-id not found',
      );
    });
  });
});
