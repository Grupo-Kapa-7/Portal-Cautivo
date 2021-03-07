import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {GuestMacAddress, GuestMacAddressRelations, GuestUser} from '../models';
import {GuestUserRepository} from './guest-user.repository';

export class GuestMacAddressRepository extends DefaultCrudRepository<
  GuestMacAddress,
  typeof GuestMacAddress.prototype.idGuestUser,
  GuestMacAddressRelations
> {

  public readonly guestUser: BelongsToAccessor<GuestUser, typeof GuestMacAddress.prototype.guestUser>;

  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource, @repository.getter('GuestUserRepository') protected guestUserRepositoryGetter: Getter<GuestUserRepository>,
  ) {
    super(GuestMacAddress, dataSource);
    this.guestUser = this.createBelongsToAccessorFor('guestUser', guestUserRepositoryGetter,);
    this.registerInclusionResolver('guestUser', this.guestUser.inclusionResolver);
  }
}
