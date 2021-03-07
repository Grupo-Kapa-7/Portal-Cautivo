import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  GuestMacAddress,
  GuestUser,
} from '../models';
import {GuestMacAddressRepository} from '../repositories';

export class GuestMacAddressGuestUserController {
  constructor(
    @repository(GuestMacAddressRepository)
    public guestMacAddressRepository: GuestMacAddressRepository,
  ) { }

  @get('/api/guest-mac-addresses/{id}/guest-user', {
    responses: {
      '200': {
        description: 'GuestUser belonging to GuestMacAddress',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(GuestUser)},
          },
        },
      },
    },
  })
  async getGuestUser(
    @param.path.string('id') id: typeof GuestMacAddress.prototype.idGuestUser,
  ): Promise<GuestUser> {
    return this.guestMacAddressRepository.guestUser(id);
  }
}
