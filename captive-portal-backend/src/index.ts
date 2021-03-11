import { LoggingBindings } from '@loopback/logging';
import { RestBindings } from '@loopback/rest';
import { format, LoggerOptions } from 'winston';
import {ApplicationConfig, CaptivePortalBackendApplication} from './application';
const os = require('os')
const { graphqlHTTP } = require('express-graphql');
import { createGraphQLSchema } from 'openapi-to-graphql';
import { Oas3 } from 'openapi-to-graphql/lib/types/oas3';
export * from './application';
const fs = require('fs');
const portalConfig = JSON.parse(fs.readFileSync('portalconfig.json', {encoding: 'utf8'}));

export async function main(options: ApplicationConfig = {}) {
  process.setMaxListeners(0);
  const app = new CaptivePortalBackendApplication(options);
  await app.boot();
  await app.migrateSchema();
  await app.start();
  app.bind(RestBindings.ERROR_WRITER_OPTIONS).to({debug: true});
  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  const graphqlPath = '/graphql';
    let oas: Oas3;
    await app.restServer.getApiSpec().then((resolved) => {oas = <Oas3>resolved}).finally(async () => {
    const {schema} = await createGraphQLSchema(oas, {
        strict: false,
        viewer: true,
        baseUrl: url,
        headers: {
            'X-Origin': 'GraphQL'
        },
        tokenJSONpath: '$.jwt'
    })

    const handler =  graphqlHTTP( (request, response, graphQLParams) => ({
        schema,
        pretty: true,
        graphiql: process.env.NODE_ENV === 'development', // Needed to activate apollo dev tools (Without true then interface does not load)
        context: { jwt: getJwt(request) }
    }))

    // Get the jwt from the Authorization header and place in context.jwt, which is then referenced in tokenJSONpath
    function getJwt(req:any) {
        if (req.headers && req.headers.authorization) {
            return req.headers.authorization.replace(/^Bearer /, '');
        }
    }

    app.mountExpressRouter(graphqlPath, handler);
    console.log(`Graphql API: ${url}${graphqlPath}`);
  });

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
