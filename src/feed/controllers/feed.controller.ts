import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Observable, map, of, switchMap } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';

import { JwtGuard } from '../../auth/guards/jwt.guard';

import { FeedPost } from '../models/post.interface';
import { FeedService } from '../services/feed.service';

import { IsCreatorGuard } from '../guards/is-creator.guard';
import { isFileExtensionSafe, removeFile, saveImageToStorage } from 'src/auth/helpers/image-storage';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  // @Roles(Role.ADMIN, Role.PREMIUM)
  // @UseGuards(JwtGuard, RolesGuard)
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() feedPost: FeedPost, @Request() req): Observable<FeedPost> {
    console.log("feedPost:  ", feedPost);
    // console.log("req: ", req);
    return this.feedService.createPost(req.user, feedPost);
  }

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() feedPost: FeedPost,
    @Request() req,
  ): Observable<{ modifiedFileName: string } | { error: string }> {


    console.log("i am in upload" , feedPost);
    const fileName = file?.filename;

    console.log("hi", fileName);
    if (!fileName) return of({ error: 'File must be a png, jpg/jpeg' });

    const imagesFolderPath = join(process.cwd(), 'images');
    const fullImagePath = join(imagesFolderPath + '/' + file.filename);

    return isFileExtensionSafe(fullImagePath).pipe(
      switchMap((isFileLegit: boolean) => {
        if (isFileLegit) {
          const userId = req.user.id;
          // return this.userService.updateUserImageById(userId, fileName).pipe(
          //   map(() => ({
          //     modifiedFileName: file.filename,
          //   })),
          // );

          return this.feedService.putImageinPost(userId, feedPost, fileName).pipe(
            map(() => ({
                  modifiedFileName: file.filename,
                })),
          )
          
        }
        removeFile(fullImagePath);
        return of({ error: 'File content does not match extension!' });
      }),
    );
  }

  // @Get()
  // findAll(): Observable<FeedPost[]> {
  //   return this.feedService.findAllPosts();
  // }

  @UseGuards(JwtGuard)
  @Get()
  findSelected(
    @Query('take') take: number = 1,
    @Query('skip') skip: number = 1,
  ): Observable<FeedPost[]> {
    take = take > 20 ? 20 : take;
    return this.feedService.findPosts(take, skip);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() feedPost: FeedPost,
  ): Observable<UpdateResult> {
    return this.feedService.updatePost(id, feedPost);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Delete(':id')
  delete(@Param('id') id: number): Observable<DeleteResult> {
    return this.feedService.deletePost(id);
  }

  @Get('image/:fileName')
  findImageByName(@Param('fileName') fileName: string, @Res() res) {
    if (!fileName || ['null', '[null]'].includes(fileName)) return;
    return res.sendFile(fileName, { root: './images' });
  }

  @UseGuards(JwtGuard)
  @Post(':id/like')
  likePost(
    @Param('id') postId: number,
    @Request() req,
  ): Promise<FeedPost> {
    // const id = parseInt(postId);
    console.log("id: ", postId);
    console.log("req.user.id: ", req.user.id);

     return this.feedService.likePost(postId, req.user.id);
    // return this.feedService.updatePost
  }
}
