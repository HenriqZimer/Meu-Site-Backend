import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContactsService } from './contacts.service';

describe('ContactsService', () => {
  let service: ContactsService;
  let mockContactModel: any;

  beforeEach(() => {
    const mockExec = vi.fn();
    const mockSort = vi.fn(() => ({ exec: mockExec }));
    const mockFindByIdAndUpdate = vi.fn(() => ({ exec: mockExec }));
    const mockFindByIdAndDelete = vi.fn(() => ({ exec: mockExec }));

    // Mock constructor function
    const MockModel = vi.fn((data: any) => ({
      ...data,
      save: vi.fn().mockResolvedValue({ _id: '1', ...data }),
    }));

    mockContactModel = MockModel as any;
    mockContactModel.find = vi.fn(() => ({ sort: mockSort }));
    mockContactModel.findById = vi.fn(() => ({ exec: mockExec }));
    mockContactModel.findByIdAndUpdate = mockFindByIdAndUpdate;
    mockContactModel.findByIdAndDelete = mockFindByIdAndDelete;

    service = new ContactsService(mockContactModel);
  });

  describe('create', () => {
    it('should create a new contact', async () => {
      const createDto = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      };

      const result = await service.create(createDto);

      expect(result._id).toBe('1');
      expect(mockContactModel).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all contacts sorted by createdAt desc', async () => {
      const mockContacts = [
        { _id: '1', name: 'John', email: 'john@example.com', read: false },
        { _id: '2', name: 'Jane', email: 'jane@example.com', read: true },
      ];

      const mockExec = vi.fn().mockResolvedValue(mockContacts);
      const mockSort = vi.fn(() => ({ exec: mockExec }));
      mockContactModel.find.mockReturnValue({ sort: mockSort });

      const result = await service.findAll();

      expect(result).toEqual(mockContacts);
      expect(mockContactModel.find).toHaveBeenCalled();
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('findById', () => {
    it('should return a contact by id', async () => {
      const mockContact = {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      const mockExec = vi.fn().mockResolvedValue(mockContact);
      mockContactModel.findById.mockReturnValue({ exec: mockExec });

      const result = await service.findById('1');

      expect(result).toEqual(mockContact);
      expect(mockContactModel.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('markAsRead', () => {
    it('should mark contact as read', async () => {
      const mockContact = {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        read: true,
        readAt: expect.any(Date),
      };

      const mockExec = vi.fn().mockResolvedValue(mockContact);
      mockContactModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

      const result = await service.markAsRead('1');

      expect(result.read).toBe(true);
      expect(mockContactModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('toggleRead', () => {
    it('should toggle read status from false to true', async () => {
      const existingContact = {
        _id: '1',
        name: 'John',
        read: false,
      };

      const updatedContact = {
        ...existingContact,
        read: true,
        readAt: expect.any(Date),
      };

      const mockFindExec = vi.fn().mockResolvedValue(existingContact);
      const mockUpdateExec = vi.fn().mockResolvedValue(updatedContact);

      mockContactModel.findById.mockReturnValue({ exec: mockFindExec });
      mockContactModel.findByIdAndUpdate.mockReturnValue({ exec: mockUpdateExec });

      const result = await service.toggleRead('1');

      expect(result.read).toBe(true);
      expect(mockContactModel.findById).toHaveBeenCalledWith('1');
      expect(mockContactModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw error if contact not found', async () => {
      const mockExec = vi.fn().mockResolvedValue(null);
      mockContactModel.findById.mockReturnValue({ exec: mockExec });

      await expect(service.toggleRead('invalid-id')).rejects.toThrow('Contact not found');
    });
  });

  describe('delete', () => {
    it('should delete a contact', async () => {
      const mockContact = {
        _id: '1',
        name: 'John Doe',
      };

      const mockExec = vi.fn().mockResolvedValue(mockContact);
      mockContactModel.findByIdAndDelete.mockReturnValue({ exec: mockExec });

      const result = await service.delete('1');

      expect(result).toEqual(mockContact);
      expect(mockContactModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });
  });
});
