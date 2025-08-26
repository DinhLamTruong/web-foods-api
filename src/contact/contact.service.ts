import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(contact: Contact): Promise<Contact> {
    return this.contactRepository.save(contact);
  }

  async findAll(): Promise<Contact[]> {
    return this.contactRepository.find();
  }
}
