import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {LdapdsDataSource} from '../datasources';
import {Login, LoginRelations} from '../models';

export class LoginRepository extends DefaultCrudRepository<
  Login,
  typeof Login.prototype.username,
  LoginRelations
> {
  constructor(
    @inject('datasources.LDAPDS') dataSource: LdapdsDataSource,
  ) {
    super(Login, dataSource);
  }
}
