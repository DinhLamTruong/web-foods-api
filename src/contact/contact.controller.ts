import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() contact: Contact): Promise<Contact> {
    // Truncate message to max 1000 characters to avoid DB errors
    if (contact.message && contact.message.length > 1000) {
      contact.message = contact.message.substring(0, 1000);
    }
    return this.contactService.create(contact);
  }

  @Get()
  async findAll(): Promise<Contact[]> {
    return this.contactService.findAll();
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.contactService.delete(+id);
  }
}
