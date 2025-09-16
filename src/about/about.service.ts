import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {About} from './about.entity'
import {ConfigService} from '@nestjs/config'
import {addDomainToContent, getHostUrl, removeDomainFromContent} from '../utils/domain.util'

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(About)
    private readonly aboutRepository: Repository<About>,
    private configService: ConfigService,
  ) {}

  private getHostUrl(): string {
    return getHostUrl(this.configService)
  }

  async findOne(): Promise<About> {
    const about = await this.aboutRepository.findOneBy({}) // Get the only record

    if (!about) {
      throw new Error('About content not found')
    }

    const host = this.getHostUrl()
    // Add domain to the <img> card in 'content'
    if (about?.content) {
      about.content = addDomainToContent(about.content, host)
    }

    return about
  }

  async create(content: string): Promise<About> {
    const count = await this.aboutRepository.count()
    if (count > 0) {
      throw new Error('About content already exists')
    }
    const about = this.aboutRepository.create({content})
    return this.aboutRepository.save(about)
  }

  async update(content: string): Promise<About> {
    const about = await this.findOne()
    if (!about) {
      throw new Error('About content not found')
    }

    const host = this.getHostUrl()
    // Remove the domain from 'content' if any
    if (content) {
      about.content = removeDomainFromContent(content, host)
    }

    return this.aboutRepository.save(about)
  }

  async remove(): Promise<void> {
    const about = await this.findOne()
    if (about) {
      await this.aboutRepository.remove(about)
    }
  }
}
