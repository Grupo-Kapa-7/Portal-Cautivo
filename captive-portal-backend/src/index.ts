import { LoggingBindings } from '@loopback/logging';
import { RestBindings } from '@loopback/rest';
import { format, LoggerOptions } from 'winston';
import {ApplicationConfig, CaptivePortalBackendApplication} from './application';
const os = require('os')

export * from './application';

// var users = {user1: 'secret_password'}
// var tephra = require('tephra')
// var server = new tephra(
//   'secret',
//   1812, // authentication port
//   1813, // accounting port
//   3799, // change of authorisation port
//   [ // define any vendor dictionaries for vendor-specific attributes

//   ]
// )

export async function main(options: ApplicationConfig = {}) {
  const app = new CaptivePortalBackendApplication(options);
  await app.boot();
  await app.migrateSchema();
  await app.start();
  app.bind(RestBindings.ERROR_WRITER_OPTIONS).to({debug: true});
  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  // server.on('Access-Request', function(packet:any, rinfo:any, accept:any, reject:any) 
  // {
  //   try
  //   {
  //     console.log(packet.attributes);
  //     var username  = packet.attributes['User-Name'],
  //         password = packet.attributes['User-Password']
  //     if (username in users && users[username] === password) {
  //       return accept(
  //         [
  //           // ['put', 'your'],
  //           // ['response', 'attribute'],
  //           // ['pairs', 'here']
  //         ],
  //         { /* and vendor attributes here */
  //           // some_vendor: [
  //           //   ['foo', 'bar']
  //           // ]
  //         },
  //         console.log
  //       )
  //     }
  //     reject([], {}, console.log)
  //   }
  //   catch(err)
  //   {
  //     console.log(err);
  //   }
  // }).on('Accounting-Request', function(packet:any, rinfo:any, respond:any) 
  // {
  //   // catch all accounting-requests
  //   respond([], {}, console.log)
  // }).on('Accounting-Request-Start', function(packet:any, rinfo:any, respond:any) 
  // {
  //   // or just catch specific accounting-request status types...
  //   respond([], {}, console.log)
  // }).on('Accounting-Request-Interim-Update', function(packet:any, rinfo:any, respond:any) 
  // {
  //   respond([], {}, console.log)
  // }).on('Accounting-Request-Stop', function(packet:any, rinfo:any, respond:any) 
  // {
  //   respond([], {}, console.log)
  // })

  // server.bind()
  console.log("Radius Server On");

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: '0.0.0.0',
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
