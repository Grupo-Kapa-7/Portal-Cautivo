import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Portal, PortalRelations} from '../models';

export class PortalRepository extends DefaultCrudRepository<
  Portal,
  typeof Portal.prototype.id,
  PortalRelations
> {
  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource,
  ) {
    super(Portal, dataSource);
  }
}
