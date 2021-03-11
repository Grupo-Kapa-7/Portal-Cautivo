import { authenticate } from '@loopback/authentication';
import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {GuestUser} from '../models';
import {GuestUserRepository} from '../repositories';

export class GuestUserController {
  constructor(
    @repository(GuestUserRepository)
    public guestUserRepository : GuestUserRepository,
  ) {}

  @post('/api/guest-user')
  @response(200, {
    description: 'GuestUser model instance',
    content: {'application/json': {schema: getModelSchemaRef(GuestUser)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestUser, {
            title: 'NewGuestUser',
            exclude: ['id'],
          }),
        },
      },
    })
    guestUser: Omit<GuestUser, 'id'>,
  ): Promise<GuestUser> {
    return this.guestUserRepository.create(guestUser);
  }

  @authenticate('jwt')
  @get('/api/guest-user/count')
  @response(200, {
    description: 'GuestUser model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(GuestUser) where?: Where<GuestUser>,
  ): Promise<Count> {
    return this.guestUserRepository.count(where);
  }

  @authenticate('jwt')
  @get('/api/guest-user')
  @response(200, {
    description: 'Array of GuestUser model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(GuestUser, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(GuestUser) filter?: Filter<GuestUser>,
  ): Promise<GuestUser[]> {
    return this.guestUserRepository.find(filter);
  }

  @authenticate('jwt')
  @patch('/api/guest-user')
  @response(200, {
    description: 'GuestUser PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestUser, {partial: true}),
        },
      },
    })
    guestUser: GuestUser,
    @param.where(GuestUser) where?: Where<GuestUser>,
  ): Promise<Count> {
    return this.guestUserRepository.updateAll(guestUser, where);
  }

  @authenticate('jwt')
  @get('/api/guest-user/{id}')
  @response(200, {
    description: 'GuestUser model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(GuestUser, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(GuestUser, {exclude: 'where'}) filter?: FilterExcludingWhere<GuestUser>
  ): Promise<GuestUser> {
    return this.guestUserRepository.findById(id, filter);
  }

  @authenticate.skip()
  @get('/api/guest-user/findByEmail/{email}')
  @response(200, {
    description: 'GuestUser model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(GuestUser, {includeRelations: true}),
      },
    },
  })
  async findByEmail(
    @param.path.string('email') email: string,
    @param.filter(GuestUser, {exclude: 'where'}) filter?: Filter<GuestUser>
  ): Promise<GuestUser|null> {
    return this.guestUserRepository.findOne({where: {email: email}});
  }


  @authenticate('jwt')
  @patch('/api/guest-user/{id}')
  @response(204, {
    description: 'GuestUser PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestUser, {partial: true}),
        },
      },
    })
    guestUser: GuestUser,
  ): Promise<void> {
    await this.guestUserRepository.updateById(id, guestUser);
  }

  @authenticate('jwt')
  @put('/api/guest-user/{id}')
  @response(204, {
    description: 'GuestUser PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() guestUser: GuestUser,
  ): Promise<void> {
    await this.guestUserRepository.replaceById(id, guestUser);
  }

  @authenticate('jwt')
  @del('/api/guest-user/{id}')
  @response(204, {
    description: 'GuestUser DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.guestUserRepository.deleteById(id);
  }
}
