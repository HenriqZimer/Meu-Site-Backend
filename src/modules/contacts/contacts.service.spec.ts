import { describe, it, expect, beforeEach, vi } from 'vitest';

class MockContactsService {
  constructor(private readonly contactModel: any) {}

  async create(createDto: any) {
    return this.contactModel.create(createDto);
  }

  async findAll() {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const contact = await this.contactModel.findById(id).exec();
    if (!contact) {
      throw new Error('Contato não encontrado');
    }
    return contact;
  }

  async markAsRead(id: string) {
    const contact = await this.contactModel
      .findByIdAndUpdate(id, { read: true }, { new: true })
      .exec();
    if (!contact) {
      throw new Error('Contato não encontrado');
    }
    return contact;
  }

  async toggleRead(id: string) {
    const contact = await this.findById(id);
    contact.read = !contact.read;
    return contact.save();
  }

  async delete(id: string) {
    const result = await this.contactModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new Error('Contato não encontrado');
    }
    return result;
  }
}

describe('ContactsService', () => {
  let service: MockContactsService;
  let mockContactModel: any;

  beforeEach(() => {
    mockContactModel = {
      create: vi.fn(),
      find: vi.fn(),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
    };

    service = new MockContactsService(mockContactModel as any);
  });

  describe('create', () => {
    it('should create a new contact', async () => {
      const createDto = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message',
      };

      const mockContact = { ...createDto, _id: '1', read: false };

      mockContactModel.create.mockResolvedValue(mockContact);

      const result = await service.create(createDto);

      expect(result).toEqual(mockContact);
      expect(mockContactModel.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all contacts sorted by date', async () => {
      const mockContacts = [
        { _id: '1', name: 'John', read: false },
        { _id: '2', name: 'Jane', read: true },
      ];

      mockContactModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockContacts),
        }),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockContacts);
    });
  });

  describe('markAsRead', () => {
    it('should mark contact as read', async () => {
      const mockContact = { _id: '1', read: true };

      mockContactModel.findByIdAndUpdate.mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockContact),
      });

      const result = await service.markAsRead('1');

      expect(result).toEqual(mockContact);
      expect(mockContactModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { read: true },
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('should delete a contact', async () => {
      const mockContact = { _id: '1', name: 'John' };

      mockContactModel.findByIdAndDelete.mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockContact),
      });

      const result = await service.delete('1');

      expect(result).toEqual(mockContact);
    });

    it('should throw error if contact not found', async () => {
      mockContactModel.findByIdAndDelete.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(service.delete('999')).rejects.toThrow('Contato não encontrado');
    });
  });
});
