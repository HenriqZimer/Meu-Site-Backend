import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

describe('ContactsController', () => {
  let controller: ContactsController;
  let service: ContactsService;

  const mockContact = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'Test Message',
    read: false,
  };

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      markAsRead: vi.fn(),
      toggleRead: vi.fn(),
      delete: vi.fn(),
    } as any;

    controller = new ContactsController(service);
  });

  describe('create', () => {
    it('should create a new contact', async () => {
      const createDto = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test Message',
      };

      const response = {
        message: 'Contato enviado com sucesso!',
        data: mockContact,
      };

      vi.spyOn(service, 'create').mockResolvedValue(response as any);

      const result = await controller.create(createDto as any);

      expect(result.message).toBe('Mensagem enviada com sucesso!');
      expect(result.data).toEqual(response);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all contacts', async () => {
      const contacts = [mockContact];
      vi.spyOn(service, 'findAll').mockResolvedValue(contacts as any);

      const result = await controller.findAll();

      expect(result.data).toEqual(contacts);
      expect(result.count).toBe(1);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should mark a contact as read', async () => {
      vi.spyOn(service, 'markAsRead').mockResolvedValue({ ...mockContact, read: true } as any);

      const result = await controller.markAsRead('507f1f77bcf86cd799439011');

      expect(result.message).toBe('Mensagem marcada como lida');
      expect(result.data.read).toBe(true);
      expect(service.markAsRead).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('findOne', () => {
    it('should return a contact by ID', async () => {
      vi.spyOn(service, 'findById').mockResolvedValue(mockContact as any);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result.data).toEqual(mockContact);
      expect(service.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('toggleRead', () => {
    it('should toggle contact read status to true', async () => {
      const readContact = { ...mockContact, read: true };
      vi.spyOn(service, 'toggleRead').mockResolvedValue(readContact as any);

      const result = await controller.toggleRead('507f1f77bcf86cd799439011');

      expect(result.message).toBe('Mensagem marcada como lida');
      expect(result.data).toEqual(readContact);
      expect(service.toggleRead).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should toggle contact read status to false', async () => {
      const unreadContact = { ...mockContact, read: false };
      vi.spyOn(service, 'toggleRead').mockResolvedValue(unreadContact as any);

      const result = await controller.toggleRead('507f1f77bcf86cd799439011');

      expect(result.message).toBe('Mensagem marcada como não lida');
      expect(result.data).toEqual(unreadContact);
      expect(service.toggleRead).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('remove', () => {
    it('should delete a contact', async () => {
      vi.spyOn(service, 'delete').mockResolvedValue(undefined);

      await controller.remove('507f1f77bcf86cd799439011');

      expect(service.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
