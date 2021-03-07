import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {GuestUser, GuestUserRelations} from '../models';

export class GuestUserRepository extends DefaultCrudRepository<
  GuestUser,
  typeof GuestUser.prototype.id,
  GuestUserRelations
> {
  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource,
  ) {
    super(GuestUser, dataSource);
  }
}
