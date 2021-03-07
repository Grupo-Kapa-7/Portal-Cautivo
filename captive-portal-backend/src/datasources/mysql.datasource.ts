import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
const fs = require('fs');


// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MysqlDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mysql';
  static readonly portalConfig = JSON.parse(fs.readFileSync('portalconfig.json', {encoding: 'utf8'}));

  constructor(
    @inject('datasources.config.mysql', {optional: true})
    dsConfig: object = MysqlDataSource.portalConfig.databaseOptions,
  ) {
    try
    {
      super(dsConfig);
    }
    catch(e)
    {
      console.log(e);
    }
  }
}
