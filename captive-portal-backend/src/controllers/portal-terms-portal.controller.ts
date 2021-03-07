import { authenticate } from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  PortalTerms,
  Portal,
} from '../models';
import {PortalTermsRepository} from '../repositories';

export class PortalTermsPortalController {
  constructor(
    @repository(PortalTermsRepository) protected portalTermsRepository: PortalTermsRepository,
  ) { }

  @authenticate('jwt')
  @get('/api/portal-terms/{id}/portal', {
    responses: {
      '200': {
        description: 'PortalTerms has one Portal',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Portal),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Portal>,
  ): Promise<Portal> {
    return this.portalTermsRepository.portal(id).get(filter);
  }

  @authenticate('jwt')
  @post('/portal-terms/{id}/portal', {
    responses: {
      '200': {
        description: 'PortalTerms model instance',
        content: {'application/json': {schema: getModelSchemaRef(Portal)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof PortalTerms.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Portal, {
            title: 'NewPortalInPortalTerms',
            exclude: ['id'],
            optional: ['portalTermsId']
          }),
        },
      },
    }) portal: Omit<Portal, 'id'>,
  ): Promise<Portal> {
    return this.portalTermsRepository.portal(id).create(portal);
  }

  @authenticate('jwt')
  @patch('/portal-terms/{id}/portal', {
    responses: {
      '200': {
        description: 'PortalTerms.Portal PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Portal, {partial: true}),
        },
      },
    })
    portal: Partial<Portal>,
    @param.query.object('where', getWhereSchemaFor(Portal)) where?: Where<Portal>,
  ): Promise<Count> {
    return this.portalTermsRepository.portal(id).patch(portal, where);
  }

  @authenticate('jwt')
  @del('/portal-terms/{id}/portal', {
    responses: {
      '200': {
        description: 'PortalTerms.Portal DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Portal)) where?: Where<Portal>,
  ): Promise<Count> {
    return this.portalTermsRepository.portal(id).delete(where);
  }
}
