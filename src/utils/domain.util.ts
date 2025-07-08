import {ConfigService} from '@nestjs/config'

export const getHostUrl = (configService: ConfigService): string => {
  return configService.get<string>('app.host') || ''
}

export function addDomainToContent(content: string, host: string): string {
  return content?.replace(/<img[^>]+src="([^"]+)"/g, `<img src="${host}$1"`)
}

export function addDomainToUrl(url: string, host: string): string {
  return url ? `${host}${url}` : url
}

export function removeDomainFromContent(content: string, host: string): string {
  return content?.replace(new RegExp(`<img[^>]+src="${host}([^"]+)"`, 'g'), `<img src="$1"`)
}

export function removeDomainFromUrl(url: string, host: string): string {
  return url?.replace(new RegExp(`^${host}`), '')
}
