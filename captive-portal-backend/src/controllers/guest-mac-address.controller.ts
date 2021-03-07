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
import {GuestMacAddress, GuestMacAddressRelations} from '../models';
import {GuestMacAddressRepository} from '../repositories';

export class GuestMacAddressController {
  constructor(
    @repository(GuestMacAddressRepository)
    public guestMacAddressRepository : GuestMacAddressRepository,
  ) {}

  @post('/api/guest-mac-addresses')
  @response(200, {
    description: 'GuestMacAddress model instance',
    content: {'application/json': {schema: getModelSchemaRef(GuestMacAddress)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestMacAddress, {
            title: 'NewGuestMacAddress',
            
          }),
        },
      },
    })
    guestMacAddress: GuestMacAddress,
  ): Promise<GuestMacAddress> {
    return this.guestMacAddressRepository.create(guestMacAddress);
  }

  @authenticate('jwt')
  @get('/api/guest-mac-addresses/count')
  @response(200, {
    description: 'GuestMacAddress model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(GuestMacAddress) where?: Where<GuestMacAddress>,
  ): Promise<Count> {
    return this.guestMacAddressRepository.count(where);
  }

  @authenticate('jwt')
  @get('/api/guest-mac-addresses')
  @response(200, {
    description: 'Array of GuestMacAddress model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(GuestMacAddress, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(GuestMacAddress) filter?: Filter<GuestMacAddress>,
  ): Promise<GuestMacAddress[]> {
    return this.guestMacAddressRepository.find(filter);
  }

  @authenticate('jwt')
  @patch('/api/guest-mac-addresses')
  @response(200, {
    description: 'GuestMacAddress PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestMacAddress, {partial: true}),
        },
      },
    })
    guestMacAddress: GuestMacAddress,
    @param.where(GuestMacAddress) where?: Where<GuestMacAddress>,
  ): Promise<Count> {
    return this.guestMacAddressRepository.updateAll(guestMacAddress, where);
  }

  @get('/api/guest-mac-addresses/{id}')
  @response(200, {
    description: 'GuestMacAddress model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(GuestMacAddress, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') macAddress: string,
    @param.filter(GuestMacAddress, {exclude: 'where'}) filter?: FilterExcludingWhere<GuestMacAddress>
  ): Promise<GuestMacAddress> {
    return this.guestMacAddressRepository.findById(macAddress, filter);
  }

  @authenticate('jwt')
  @patch('/api/guest-mac-addresses/{id}')
  @response(204, {
    description: 'GuestMacAddress PATCH success',
  })
  async updateById(
    @param.path.string('id') macAddress: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestMacAddress, {partial: true}),
        },
      },
    })
    guestMacAddress: GuestMacAddress,
  ): Promise<void> {
    await this.guestMacAddressRepository.updateById(macAddress, guestMacAddress);
  }

  @authenticate('jwt')
  @put('/api/guest-mac-addresses/{id}')
  @response(204, {
    description: 'GuestMacAddress PUT success',
  })
  async replaceById(
    @param.path.string('id') macAddress: string,
    @requestBody() guestMacAddress: GuestMacAddress,
  ): Promise<void> {
    await this.guestMacAddressRepository.replaceById(macAddress, guestMacAddress);
  }

  @authenticate('jwt')
  @del('/api/guest-mac-addresses/{id}')
  @response(204, {
    description: 'GuestMacAddress DELETE success',
  })
  async deleteById(@param.path.string('id') id: number): Promise<void> {
    await this.guestMacAddressRepository.deleteById(id);
  }
}
