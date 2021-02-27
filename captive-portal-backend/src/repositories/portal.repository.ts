import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PortalDatasourceDataSource} from '../datasources';
import {Portal, PortalRelations} from '../models';

export class PortalRepository extends DefaultCrudRepository<
  Portal,
  typeof Portal.prototype.id,
  PortalRelations
> {
  constructor(
    @inject('datasources.PortalDatasource') dataSource: PortalDatasourceDataSource,
  ) {
    super(Portal, dataSource);
  }
}
