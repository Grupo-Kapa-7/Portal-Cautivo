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
import {Portal} from '../models';
import {PortalRepository} from '../repositories';

export class PortalController {
  constructor(
    @repository(PortalRepository)
    public portalRepository : PortalRepository,
  ) {}

  @post('/api/portals')
  @response(200, {
    description: 'Portal model instance',
    content: {'application/json': {schema: getModelSchemaRef(Portal)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Portal, {
            title: 'NewPortal',
            exclude: ['id'],
          }),
        },
      },
    })
    portal: Omit<Portal, 'id'>,
  ): Promise<Portal> {
    return this.portalRepository.create(portal);
  }

  @get('/api/portals/count')
  @response(200, {
    description: 'Portal model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Portal) where?: Where<Portal>,
  ): Promise<Count> {
    return this.portalRepository.count(where);
  }

  @get('/api/portals')
  @response(200, {
    description: 'Array of Portal model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Portal, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Portal) filter?: Filter<Portal>,
  ): Promise<Portal[]> {
    return this.portalRepository.find(filter);
  }

  @patch('/api/portals')
  @response(200, {
    description: 'Portal PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Portal, {partial: true}),
        },
      },
    })
    portal: Portal,
    @param.where(Portal) where?: Where<Portal>,
  ): Promise<Count> {
    return this.portalRepository.updateAll(portal, where);
  }

  @get('/api/portals/{id}')
  @response(200, {
    description: 'Portal model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Portal, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Portal, {exclude: 'where'}) filter?: FilterExcludingWhere<Portal>
  ): Promise<Portal> {
    return this.portalRepository.findById(id, filter);
  }

  @patch('/api/portals/{id}')
  @response(204, {
    description: 'Portal PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Portal, {partial: true}),
        },
      },
    })
    portal: Portal,
  ): Promise<void> {
    await this.portalRepository.updateById(id, portal);
  }

  @put('/api/portals/{id}')
  @response(204, {
    description: 'Portal PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() portal: Portal,
  ): Promise<void> {
    await this.portalRepository.replaceById(id, portal);
  }

  @del('/api/portals/{id}')
  @response(204, {
    description: 'Portal DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.portalRepository.deleteById(id);
  }
}
