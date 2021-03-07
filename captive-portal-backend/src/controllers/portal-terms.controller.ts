import { authenticate } from '@loopback/authentication';
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
import {PortalTerms} from '../models';
import {PortalTermsRepository} from '../repositories';

export class PortalTermsController {
  constructor(
    @repository(PortalTermsRepository)
    public portalTermsRepository : PortalTermsRepository,
  ) {}

  @authenticate('jwt')
  @post('/api/portal-terms')
  @response(200, {
    description: 'PortalTerms model instance',
    content: {'application/json': {schema: getModelSchemaRef(PortalTerms)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PortalTerms, {
            title: 'NewPortalTerms',
            exclude: ['id'],
          }),
        },
      },
    })
    portalTerms: Omit<PortalTerms, 'id'>,
  ): Promise<PortalTerms> {
    return this.portalTermsRepository.create(portalTerms);
  }

  @authenticate('jwt')
  @get('/api/portal-terms/count')
  @response(200, {
    description: 'PortalTerms model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(PortalTerms) where?: Where<PortalTerms>,
  ): Promise<Count> {
    return this.portalTermsRepository.count(where);
  }

  @authenticate('jwt')
  @get('/api/portal-terms')
  @response(200, {
    description: 'Array of PortalTerms model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PortalTerms, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(PortalTerms) filter?: Filter<PortalTerms>,
  ): Promise<PortalTerms[]> {
    return this.portalTermsRepository.find(filter);
  }

  @authenticate('jwt')
  @patch('/api/portal-terms')
  @response(200, {
    description: 'PortalTerms PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PortalTerms, {partial: true}),
        },
      },
    })
    portalTerms: PortalTerms,
    @param.where(PortalTerms) where?: Where<PortalTerms>,
  ): Promise<Count> {
    return this.portalTermsRepository.updateAll(portalTerms, where);
  }

  @get('/api/portal-terms/{id}')
  @response(200, {
    description: 'PortalTerms model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PortalTerms, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PortalTerms, {exclude: 'where'}) filter?: FilterExcludingWhere<PortalTerms>
  ): Promise<PortalTerms> {
    return this.portalTermsRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/api/portal-terms/{id}')
  @response(204, {
    description: 'PortalTerms PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PortalTerms, {partial: true}),
        },
      },
    })
    portalTerms: PortalTerms,
  ): Promise<void> {
    await this.portalTermsRepository.updateById(id, portalTerms);
  }

  @authenticate('jwt')
  @put('/api/portal-terms/{id}')
  @response(204, {
    description: 'PortalTerms PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() portalTerms: PortalTerms,
  ): Promise<void> {
    await this.portalTermsRepository.replaceById(id, portalTerms);
  }

  @authenticate('jwt')
  @del('/portal-terms/{id}')
  @response(204, {
    description: 'PortalTerms DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.portalTermsRepository.deleteById(id);
  }
}
