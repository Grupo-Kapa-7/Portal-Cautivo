import { inject } from '@loopback/core';
import { LoggingBindings, logInvocation, WinstonTransports } from '@loopback/logging';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  RestBindings,
} from '@loopback/rest';
import { Console } from 'console';
import e from 'express';
import { createLogger, format, Logger } from 'winston';
import {Login} from '../models';
import {LoginRepository} from '../repositories';

const fs = require('fs');
const { authenticate } = require('ldap-authentication');
const got = require('got');

class NotFound extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export async function asyncForEach<T>(array: Array<T>, callback: (item: T, index: number) => void) {
  for (let index = 0; index < array.length; index++) {
      await callback(array[index], index);
  }
}

export class LoginController {

  private authOptions : any;
  @inject(LoggingBindings.WINSTON_LOGGER)
  private logger: Logger;

  constructor(
    @repository(LoginRepository)
    public loginRepository : LoginRepository,
    @inject(RestBindings.Http.REQUEST) private request: any
  ) 
  {

    try
    {
      this.authOptions = JSON.parse(fs.readFileSync('portalconfig.json', {encoding: 'utf8'}));
    }
    catch(error)
    {
      this.logger.log('error',error);
    }

  }

  @post('/api/login')
  @logInvocation()
  @response(200, {
    description: 'Hacer login segun el tipo con el usuario y password',
    content: {'application/json': {schema: getModelSchemaRef(Login)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Login, {
            title: 'NewLogin',
          }),
        },
      },
    })
    login: Login,
  ): Promise<Object> {

    let authenticated = false;
    let authMethodsApproved = false;
    let user = null;
    let srcip = '';
    let authErrors = "";

    if(this.request.headers['x-forwarded-for'])
      srcip = this.request.headers['x-forwarded-for'];    
    else
      srcip = this.request.ip;

    this.logger.log('info',"Peticion de login de " + srcip + " para el usuario: " + login.username + " de tipo: " + login.type);

    try
    {
      if(login.type == 'ldap')
      {
        let tempOptions = this.authOptions.ldapOptions;

        tempOptions.username = login.username;
        tempOptions.userPassword = login.password;
        user = await authenticate(tempOptions)
        if(user)
        {
          this.logger.log('info',"Usuario : " + login.username + " autenticado exitosamente en LDAP ");
          authMethodsApproved = true;
        }
      }
    }
    catch(error)
    {
      this.logger.log('error',`Error al autenticar usuario ${login.username}`);
      this.logger.log('error',error);
      authErrors+=error;
      authErrors+="\n";
    }

    if(authMethodsApproved)
    {
      await asyncForEach(this.authOptions.fortigateOptions.fortigates, async function(fortigate:any) {
        try
        {
         var logger: Logger = createLogger({level: 'info',
         format: format.json(),
         defaultMeta: {framework: 'LoopBack'}, transports: [new WinstonTransports.Console(
            {
              level: 'info',
              format: format.combine(format.colorize(), format.simple())
            }),new WinstonTransports.File(
              {
                filename: "backend.log",
                maxsize: 10485760,
                maxFiles: 5,
                tailable: true,
                zippedArchive: true
              })
            ]
          });
          await (async () => {

            const client = got.extend({
              headers: {
                'Authorization' : 'Bearer ' + fortigate.api_key 
              }
            })
            
            await asyncForEach(fortigate.ldapServers, async function(server:any) {
              const {body} = await client.post('https://' + fortigate.ip + ':' + fortigate.port + '/api/v2/monitor/user/firewall/auth', {
                json: {
                  username: login.username,
                  ip: srcip,
                  ip_version: "ip4",
                  server: server.name
                },
                https: {
                  rejectUnauthorized: false
                },
                responseType: 'json'
              });
            
              if(body.status === 'success' && body.http_status == 200)
              {
                logger.log("info", "Usuario autenticado en FortiGate : " + fortigate.name + " con serial: " + body.serial);
                authenticated = true;
              }
              else
              {
                authenticated = false;
                console.log(body);

              }
            }).catch(reason => {
              logger.log("error","Error al consultar FortiGate : " + fortigate.ip  +":" + fortigate.port + "\n" + reason);
              authenticated = false;
              authErrors+=reason;
              authErrors+="\n";
            });
          })().catch((reason) => {
            logger.log("error","Error al consultar FortiGate : " + fortigate.ip  +":" + fortigate.port + "\n" + reason);
            authenticated = false;
            authErrors+=reason;
            authErrors+="\n";
          });
        }
        catch(err)
        {
          console.log(err);
        }
      });
      this.logger.log('info',"Termino el ciclo de logins por cada fortigate configurado");
    
      if(authenticated)
        return {"message" : "success", "username": login.username, "extra" : user, "srcip": srcip};
      else
        throw new NotFound('Authentication Failed\n' + authErrors, 401);
    }
    else
    {
      this.logger.log('error',"Error al autenticar el usuario : " + login.username);
      throw new NotFound('Authentication Failed', 401);
    }
  }

  @get('/api/login/myip')
  @response(200, {
    description: 'Encontrar mi ip',
  })
  async get(

  ): Promise<Object>{
    if(this.request.headers['x-forwarded-for'])
      return {"srcip" : this.request.headers['x-forwarded-for']}
    else
      return {"srcip": this.request.ip}
  }

  // @get('/login/count')
  // @response(200, {
  //   description: 'Login model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(Login) where?: Where<Login>,
  // ): Promise<Count> {
  //   return this.loginRepository.count(where);
  // }

  // @get('/login')
  // @response(200, {
  //   description: 'Array of Login model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(Login, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.filter(Login) filter?: Filter<Login>,
  // ): Promise<Login[]> {
  //   return this.loginRepository.find(filter);
  // }

  // @patch('/login')
  // @response(200, {
  //   description: 'Login PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Login, {partial: true}),
  //       },
  //     },
  //   })
  //   login: Login,
  //   @param.where(Login) where?: Where<Login>,
  // ): Promise<Count> {
  //   return this.loginRepository.updateAll(login, where);
  // }

  // @get('/login/{id}')
  // @response(200, {
  //   description: 'Login model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(Login, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.string('id') id: string,
  //   @param.filter(Login, {exclude: 'where'}) filter?: FilterExcludingWhere<Login>
  // ): Promise<Login> {
  //   return this.loginRepository.findById(id, filter);
  // }

  // @patch('/login/{id}')
  // @response(204, {
  //   description: 'Login PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Login, {partial: true}),
  //       },
  //     },
  //   })
  //   login: Login,
  // ): Promise<void> {
  //   await this.loginRepository.updateById(id, login);
  // }

  // @put('/login/{id}')
  // @response(204, {
  //   description: 'Login PUT success',
  // })
  // async replaceById(
  //   @param.path.string('id') id: string,
  //   @requestBody() login: Login,
  // ): Promise<void> {
  //   await this.loginRepository.replaceById(id, login);
  // }

  // @del('/login/{id}')
  // @response(204, {
  //   description: 'Login DELETE success',
  // })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.loginRepository.deleteById(id);
  // }
}
