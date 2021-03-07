import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Portal, PortalRelations, PortalTerms} from '../models';
import {PortalTermsRepository} from './portal-terms.repository';

export class PortalRepository extends DefaultCrudRepository<
  Portal,
  typeof Portal.prototype.id,
  PortalRelations
> {

  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource, @repository.getter('PortalTermsRepository') protected portalTermsRepositoryGetter: Getter<PortalTermsRepository>,
  ) {
    super(Portal, dataSource);
  }
}
