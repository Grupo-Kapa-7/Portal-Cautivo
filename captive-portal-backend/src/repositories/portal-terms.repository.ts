import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {PortalTerms, PortalTermsRelations, Portal} from '../models';
import {PortalRepository} from './portal.repository';

export class PortalTermsRepository extends DefaultCrudRepository<
  PortalTerms,
  typeof PortalTerms.prototype.id,
  PortalTermsRelations
> {

  public readonly portal: HasOneRepositoryFactory<Portal, typeof PortalTerms.prototype.id>;

  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource, @repository.getter('PortalRepository') protected portalRepositoryGetter: Getter<PortalRepository>,
  ) {
    super(PortalTerms, dataSource);
    this.portal = this.createHasOneRepositoryFactoryFor('portal', portalRepositoryGetter);
    this.registerInclusionResolver('portal', this.portal.inclusionResolver);
  }
}
