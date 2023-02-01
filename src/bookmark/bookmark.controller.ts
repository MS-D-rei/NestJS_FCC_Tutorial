import { GetUser } from '@/auth/decorator';
import { JwtGuard } from '@/auth/guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookmarkService } from '@/bookmark/bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from '@/bookmark/dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  /* GET: /bookmarks */
  @Get()
  getAllBookmarks(@GetUser('sub') userId: number) {
    return this.bookmarkService.getAllBookmarks(userId);
  }

  /* GET: /bookmarks/:id */
  @Get(':id')
  getBookmarkById(
    @GetUser('sub') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  /* POST: /bookmarks */
  @Post()
  createBookmark(
    @GetUser('sub') userId: number,
    @Body() createBookmarkDto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, createBookmarkDto);
  }

  /* PATCH: /bookmarks/:id */
  @Patch(':id')
  editBookmarkById(
    @GetUser('sub') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() editBookmarkDto: EditBookmarkDto,
  ) {
    return this.bookmarkService.editBookmarkById(
      userId,
      bookmarkId,
      editBookmarkDto,
    );
  }

  /* DELETE: /bookmarks/:id */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('sub') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
