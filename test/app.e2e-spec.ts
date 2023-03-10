import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { SignupDto } from '@/auth/dto';
import { JwtAccessTokenGuard } from '@/auth/guard';
import { BookmarkModule } from '@/bookmark/bookmark.module';
import { CreateBookmarkDto, EditBookmarkDto } from '@/bookmark/dto';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';
import { EditUserDto } from '@/user/dto';
import { UserModule } from '@/user/user.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        UserModule,
        BookmarkModule,
        PrismaModule,
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: APP_GUARD,
          useExisting: JwtAccessTokenGuard,
        },
        JwtAccessTokenGuard,
      ],
    }).compile();

    // init app
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(4001);

    // delete all data in test DB
    prisma = app.get(PrismaService);
    await prisma.cleanDB();

    pactum.request.setBaseUrl('http://localhost:4001');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: SignupDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@gmail.com',
      password: 'Password',
    };
    describe('Signup', () => {
      it('201 when valid email and password', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
        // .inspect(); // can show content of response
      });
      it('400 if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: '' })
          .expectStatus(400);
      });
      it('400 if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: 'valid@gmail.com', password: '' })
          .expectStatus(400);
      });
      it('403 if email is not unique', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(403);
      });
    });
    describe('Login', () => {
      it('200 when valid email and password', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token')
          .stores('userRefreshToken', 'refresh_token');
      });
      it('400 if email empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: '', password: 'Password' })
          .expectStatus(400);
      });
      it('400 if password empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: 'john@gmail.com', password: '' })
          .expectStatus(400);
      });
      it('400 if no body', () => {
        return pactum.spec().post('/auth/login').expectStatus(400);
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('200 current user info when valid Authorization token', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(200);
      });
      it('401 if invalid Authorization token', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: '',
          })
          .expectStatus(401);
      });
    });
    describe('Edit user', () => {
      const editUserDto: EditUserDto = {
        firstName: 'Taro',
        lastName: 'Tanaka',
        email: 'tanaka@gmail.com',
        password: 'Password2',
      };
      it('200 update all user info', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .withBody(editUserDto)
          .expectStatus(200)
          .expectBodyContains(editUserDto.firstName)
          .expectBodyContains(editUserDto.email);
      });
      it('200 update only email', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .withBody({ email: 'edited@gmail.com' })
          .expectStatus(200)
          .expectBodyContains('edited@gmail.com');
      });
      it('200 update only password', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: `Bearer $S{userAccessToken}` })
          .withBody({ password: 'editedPassword' })
          .expectStatus(200);
      });
    });
  });
  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('200 should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: `Bearer $S{userAccessToken}` })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create new bookmark', () => {
      const createBookmarkDto: CreateBookmarkDto = {
        title: 'First Bookmark',
        description: 'free code camp nestjs tutorial',
        link: 'https://youtu.be/GHTA143_b-s',
      };
      it('201 new bookmark saved to DB', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: `Bearer $S{userAccessToken}` })
          .withBody(createBookmarkDto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get bookmarks', () => {
      it('200 get all bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: `Bearer $S{userAccessToken}` })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Get bookmark by id', () => {
      it('200 get the bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({ Authorization: `Bearer $S{userAccessToken}` })
          .expectStatus(200)
          .expectBodyContains(`$S{bookmarkId}`);
      });
    });
    describe('Edit bookmark', () => {
      const editBookmarkDto: EditBookmarkDto = {
        title: 'Edited Bookmark',
        description: 'ChatGPT Clone ??? OpenAI API and React Tutorial',
        link: 'https://youtu.be/98bGwOYoEGg',
      };
      it('200 edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({ Authorization: `Bearer $S{userAccessToken}` })
          .withBody(editBookmarkDto)
          .expectStatus(200)
          .expectBodyContains(editBookmarkDto.title);
      });
    });
    describe('Delete bookmark', () => {
      it('204 delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({ Authorization: `Bearer $S{userAccessToken}` })
          .expectStatus(204);
      });
      it('200 should get empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({ Authorization: `Bearer $S{userAccessToken}` })
          .expectStatus(200)
          .expectBody('');
      });
    });
  });
});

// nest autogenerated app e2e test code below
// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
// import { AppModule } from './../src/app.module';

// describe('AppController (e2e)', () => {
//   let app: INestApplication;

//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     await app.init();
//   });

//   it('/ (GET)', () => {
//     return request(app.getHttpServer())
//       .get('/')
//       .expect(200)
//       .expect('Hello World!');
//   });
// });
