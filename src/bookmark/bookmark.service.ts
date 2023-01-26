import { PrismaService } from '@/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from '@/bookmark/dto';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}

  async getAllBookmarks(userId: number) {
    const allBookmarks = await this.prismaService.bookmark.findMany({
      where: {
        userId: userId,
      },
    });
    return allBookmarks;
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    return bookmark;
  }

  async createBookmark(userId: number, createBookmarkDto: CreateBookmarkDto) {
    const newBookmark = await this.prismaService.bookmark.create({
      data: {
        ...createBookmarkDto,
        userId: userId,
      },
    });
    return newBookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    editBookmarkDto: EditBookmarkDto,
  ) {
    /* get bookmark by bookmarkId */
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    /* if the bookmark doesn't exist or the user doesn't own the bookmark */
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to the resource denied');
    }
    const editedBookmark = this.prismaService.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...editBookmarkDto,
      },
    });
    return editedBookmark;
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    /* get bookmark by bookmarkId */
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    /* if the bookmark doesn't exist or the user doesn't own the bookmark */
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to the resource denied');
    }

    await this.prismaService.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
