import {injectable, /* inject, */ BindingScope, Component, LifeCycleObserver, CoreBindings, inject, Binding, config, BindingKey} from '@loopback/core';
import { LoggingBindings, WinstonTransports } from '@loopback/logging';
import { juggler, repository } from '@loopback/repository';
import { GuestMacAddressRepository, GuestUserRepository } from '../repositories';
const fs = require('fs');
const portalConfig = JSON.parse(fs.readFileSync('portalconfig.json', {encoding: 'utf8'}));
var tephra = require('tephra')
var logger: Logger;
import winstonModule, { loggers } from 'winston';
import DailyRotateFile = require("winston-daily-rotate-file");
import { SyslogTransportOptions, Syslog } from 'winston-syslog';
import { createLogger, format, Logger } from 'winston';
import winston from 'winston/lib/winston/config';

export namespace RadiusServiceBindings {
  export const USER_REPOSITORY = 'repositories.GuestUserRepository';
  export const MACADDRESS_REPOSITORY = 'repositories.GuestMacAddressRepository'
  export const DATASOURCE_NAME = 'mysql'
}

//@injectable({scope: BindingScope.APPLICATION})
export class RadiusComponent implements Component, LifeCycleObserver{
  bindings: Binding[] = [
    Binding.bind(RadiusServiceBindings.USER_REPOSITORY).toClass(GuestUserRepository),
    Binding.bind(RadiusServiceBindings.MACADDRESS_REPOSITORY).toClass(GuestMacAddressRepository)
  ];

  server = new tephra(
    portalConfig.radiusServerOptions.secret,
    portalConfig.radiusServerOptions.radiusPort, // authentication port
    portalConfig.radiusServerOptions.accountingPort, // accounting port
    portalConfig.radiusServerOptions.authorizationPort, // change of authorisation port
    portalConfig.radiusServerOptions.customDictionaries
  );

  constructor(@inject(`datasources.mysql`)
  dataSource: juggler.DataSource, @repository(GuestUserRepository) guestUserRepository: GuestUserRepository, @repository(GuestMacAddressRepository) guestMacAddressRepository: GuestMacAddressRepository, @inject(CoreBindings.APPLICATION_INSTANCE) private app) 
  {

    const fileTransport = new winstonModule.transports.DailyRotateFile({
      filename: "backend-%DATE%.log",
      maxSize: '10m',
      maxFiles: '7d',
      level: portalConfig.loggingOptions.defaultLevel,
      zippedArchive: true,
    });

    fileTransport.on('rotate', function(oldFilename, newFilename){
      console.log(`Rotating log file from ${oldFilename} to ${newFilename}`);
    });

    var syslogTransport = new Syslog();
    if(portalConfig.loggingOptions.syslogConfig.enabled)
    {
      syslogTransport = new Syslog({
        host : portalConfig.loggingOptions.syslogConfig.host,
        port : portalConfig.loggingOptions.syslogConfig.port,
        protocol : portalConfig.loggingOptions.syslogConfig.protocol,
        facility : portalConfig.loggingOptions.syslogConfig.facility,
        localhost : portalConfig.loggingOptions.syslogConfig.localhost,
        type : portalConfig.loggingOptions.syslogConfig.type,
        app_name : portalConfig.loggingOptions.syslogConfig.app_name,
        format: format.logstash()
      });
    }

   logger = createLogger({level: 'info',
   format: format.json(),
   defaultMeta: {framework: 'LoopBack'}, transports: [new WinstonTransports.Console(
      {
        level: 'info',
        format: format.combine(format.colorize(), format.simple())
      }),
      fileTransport]
    });
    if(portalConfig.loggingOptions.syslogConfig.enabled)
      logger.transports.push(syslogTransport);

    this.server.on('Access-Request', async function(packet:any, rinfo:any, accept:any, reject:any) 
    {
      try
      {
        var username  = packet.attributes['User-Name'],
            password = packet.attributes['User-Password'];
        const user = await (await guestUserRepository).findOne({where: {email: username}});
        if(user)
        {
          const mac = await (await guestMacAddressRepository).findOne({where: {"and" : [{idGuestUser: user.id}, {macAddress: password}]}});
          if(mac)
          {
            logger.log('info', `RADIUS: User ${user.email} authenticated successfully`);
            return accept(
              [
                // ['put', 'your'],
                // ['response', 'attribute'],
                // ['pairs', 'here']
              ],
              { /* and vendor attributes here */
                // some_vendor: [
                //   ['foo', 'bar']
                // ]
              })
          }
        }
        logger.log('error', `RADIUS: User ${username} with Mac Address ${password} failed to authenticate`);
        reject([], {})
      }
      catch(err)
      {
        console.log(err);
      }
    }).on('Accounting-Request', function(packet:any, rinfo:any, respond:any) 
    {
      // catch all accounting-requests
      respond([], {}, console.log)
    }).on('Accounting-Request-Start', function(packet:any, rinfo:any, respond:any) 
    {
      // or just catch specific accounting-request status types...
      respond([], {}, console.log)
    }).on('Accounting-Request-Interim-Update', function(packet:any, rinfo:any, respond:any) 
    {
      respond([], {}, console.log)
    }).on('Accounting-Request-Stop', function(packet:any, rinfo:any, respond:any) 
    {
      respond([], {}, console.log)
    })

  }

  start()
  {
    this.server.bind()
    console.log("Radius Server On");
  }

  stop()
  {
    
  }

  /*
   * Add service methods here
   */
}
