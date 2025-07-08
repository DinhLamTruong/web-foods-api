// import {
//   BadRequestException,
//   Body,
//   Controller,
//   Delete,
//   Post,
//   Query,
//   UploadedFile,
//   UploadedFiles,
//   UseGuards,
//   UseInterceptors,
// } from '@nestjs/common'
// import {FileFieldsInterceptor, FileInterceptor} from '@nestjs/platform-express'
// import {UploadService} from '@upload/upload.service'
// import {JwtAuthGuard} from '@auth/jwt-auth.guard'

// @Controller('upload')
// export class UploadController {
//   constructor(private readonly uploadService: UploadService) {}

//   @UseGuards(JwtAuthGuard)
//   @Post('image')
//   @UseInterceptors(FileInterceptor('file'))
//   async uploadImage(
//     @UploadedFile() file: Express.Multer.File,
//     @Body() req: {type: string; id?: number},
//   ) {
//     const {type, id} = req
//     if (!file) throw new BadRequestException('File is required')
//     if (!['about', 'blog', 'design', 'project', 'ourteam', 'contentBottom'].includes(type))
//       throw new BadRequestException('Invalid type')

//     if ((type === 'blog' || type === 'design') && !id)
//       throw new BadRequestException(`Type "${type}" requires id`)

//     const imagePath = await this.uploadService.uploadImage(file, type, id)
//     return {imagePath}
//   }

//   @UseGuards(JwtAuthGuard)
//   @Post('images')
//   @UseInterceptors(
//     FileFieldsInterceptor(
//       [
//         {name: 'image1', maxCount: 1},
//         {name: 'image2', maxCount: 1},
//         {name: 'imageAbout', maxCount: 1},
//       ],
//       {limits: {fileSize: 10 * 1024 * 1024}},
//     ),
//   )
//   async uploadImages(
//     @UploadedFiles()
//     files: {
//       image1?: Express.Multer.File[]
//       image2?: Express.Multer.File[]
//       imageAbout?: Express.Multer.File[]
//     },
//     @Body() req,
//   ) {
//     const {type, id} = req
//     // Ensure file is uploaded
//     if (!files) {
//       throw new BadRequestException('File is required')
//     }

//     if (!files.image1 && !files.image2 && !files.imageAbout) {
//       throw new BadRequestException('At least one file must be uploaded')
//     }

//     // Ensure valid type is provided
//     if (!type || !['home', 'about', 'design', 'blog'].includes(type)) {
//       throw new BadRequestException('Invalid type. Type must be "about", "partner", or "products".')
//     }

//     if (type === 'design' && !id) {
//       throw new BadRequestException('Invalid type. Entering as "design" must have "id".')
//     }

//     if (type === 'blog' && !id) {
//       throw new BadRequestException('Invalid type. Entering as "blog" must have "id".')
//     }

//     const uploadedPaths = await Promise.all(
//       Object.values(files).flatMap((fileArray) =>
//         fileArray.map((file) => this.uploadService.uploadImage(file, type, id)),
//       ),
//     )

//     return {uploadedPaths}
//   }

//   @UseGuards(JwtAuthGuard)
//   @Post('members')
//   @UseInterceptors(
//     FileFieldsInterceptor([
//       {name: 'image_0'},
//       {name: 'image_1'},
//       {name: 'image_2'},
//       {name: 'image_3'},
//     ]),
//   )
//   async uploadMembers(
//     @UploadedFiles() files: Record<string, Express.Multer.File[]>,
//     // @Req() req: Request,
//   ) {
//     // const {type} = req

//     const members: Express.Multer.File[] = []

//     for (let i = 0; i < 100; i++) {
//       const image = files[`image_${i}`]?.[0]

//       if (image) {
//         members.push(image)
//       }
//     }

//     const uploadedPaths = await Promise.all(
//       members.map(async (file) => {
//         return this.uploadService.uploadImage(file, 'ourteam')
//       }),
//     )

//     return {uploadedPaths}
//   }

//   @UseGuards(JwtAuthGuard)
//   @Delete('image')
//   async deleteFileOrFolder(
//     @Query('type') type: 'home' | 'about' | 'blog' | 'design',
//     @Query('name') name?: string,
//     @Query('id') id?: number,
//   ): Promise<any> {
//     if (!type || !['home', 'about', 'blog', 'design'].includes(type)) {
//       throw new BadRequestException(
//         'Invalid type. Type must be "home","about", "blog", or "design".',
//       )
//     }

//     // Call the service to handle the file/folder deletion logic
//     await this.uploadService.deleteFileOrFolder(type, name, id)

//     return {message: 'Deletion successful'}
//   }
// }
