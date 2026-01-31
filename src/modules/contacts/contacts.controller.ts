import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContactDto: CreateContactDto) {
    const contact = await this.contactsService.create(createContactDto);
    return {
      message: 'Mensagem enviada com sucesso!',
      data: contact,
    };
  }

  @Get()
  async findAll() {
    const contacts = await this.contactsService.findAll();
    return {
      data: contacts,
      count: contacts.length,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const contact = await this.contactsService.findById(id);
    return {
      data: contact,
    };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const contact = await this.contactsService.markAsRead(id);
    return {
      message: 'Mensagem marcada como lida',
      data: contact,
    };
  }

  @Patch(':id/toggle-read')
  async toggleRead(@Param('id') id: string) {
    const contact = await this.contactsService.toggleRead(id);
    return {
      message: contact.read ? 'Mensagem marcada como lida' : 'Mensagem marcada como não lida',
      data: contact,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.contactsService.delete(id);
  }
}
