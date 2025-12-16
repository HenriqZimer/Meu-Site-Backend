import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact } from './schemas/contact.schema';
import { CreateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(@InjectModel(Contact.name) private contactModel: Model<Contact>) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = new this.contactModel(createContactDto);
    return contact.save();
  }

  async findAll(): Promise<Contact[]> {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Contact> {
    return this.contactModel.findById(id).exec();
  }

  async markAsRead(id: string): Promise<Contact> {
    return this.contactModel
      .findByIdAndUpdate(id, { read: true, readAt: new Date() }, { new: true })
      .exec();
  }

  async toggleRead(id: string): Promise<Contact> {
    const contact = await this.contactModel.findById(id).exec();
    if (!contact) {
      throw new Error('Contact not found');
    }

    const newReadState = !contact.read;
    return this.contactModel
      .findByIdAndUpdate(
        id,
        {
          read: newReadState,
          readAt: newReadState ? new Date() : null,
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<Contact> {
    return this.contactModel.findByIdAndDelete(id).exec();
  }
}
