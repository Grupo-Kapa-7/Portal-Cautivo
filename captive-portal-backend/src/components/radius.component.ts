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
import { isEmpty } from 'lodash';
const radius = require('radius');
const dgram = require('dgram');
const EventEmitter = require('events');
const util = require('util');
const ip = require('ip');
const chap = require('chap');
const crypto = require('crypto');

const MicrosoftVendorID = 311;
const ChallengeKey = 11;
const NtResponseKey = 1;
const NtResponse2Key = 25;

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

    this.server.on('Access-Request', async (packet:any, rinfo:any, accept:any, reject:any) => 
    {
      try
      {
        //Check type of password
        var chap = false;
        var mschap = false;
        var authenticated = false;
        var chapChallenge = '';
        var username  = packet.attributes['User-Name'],
            password = packet.attributes['User-Password'];
        
        if(packet.attributes['CHAP-Password'] !== undefined)
        {
          chap = true;
          password = 'Encrypted CHAP Password';
          if (typeof packet.attributes['CHAP-Challenge'] !== 'undefined') {
            chapChallenge = packet.attributes['CHAP-Challenge'];
          } else {
              chapChallenge = packet.authenticator;
          }

        }

        if(username && password)
        {
          const user = await (await guestUserRepository).findOne({where: {email: username}});
          if(user)
          {
            var mac: any;
            if(!chap && !mschap)
              mac = await (await guestMacAddressRepository).findOne({where: {"and" : [{idGuestUser: user.id}, {macAddress: password}]}});
            else if(chap)
              mac = await (await guestMacAddressRepository).find({where: {idGuestUser: user.id}});
            if(mac && !chap && !mschap)
            {
              logger.log('info', mac);
              logger.log('info', `RADIUS: User ${user.email} authenticated successfully via PAP`);
              return accept([],{});
            }
            else if(mac && chap)
            {
              for(let i = 0; i < mac.length; i++ )
              {
                  if(this.chapMatch(mac[i].macAddress, packet.attributes['CHAP-Password'], chapChallenge))
                  {
                    logger.log('info', `RADIUS: User ${user.email} authenticated successfully via CHAP`);
                    authenticated = true;
                    accept([], {});
                    break;
                  }
              };
              if(!authenticated)
                reject([], {});
            }
            else
              if(!authenticated)
                reject([], {});
          }
          //Look in proxies
          else
          {
            logger.log('info', 'Proxying RADIUS packet to configured RADIUS Servers');
            var allServersFinished = false;
            portalConfig.radiusServerOptions.radiusProxyPool.forEach((server, key, arr) => 
            {
              var isLast = false;
              if(Object.is(arr.length - 1, key))
              {
                isLast = true;
              }
              var newPacket: any;
              if(!chap && !mschap)
              {
                logger.log('info', 'Proxying RADIUS packet to ' + server.ip);
                newPacket = {
                  code: "Access-Request",
                  secret: server.secret,
                  identifier:  Math.floor(Math.random() * (255-1)) + 1,
                  attributes: [
                    ['NAS-IP-Address', ip.address()],
                    ['User-Name', username],
                    ['User-Password', password]
                  ]
                }
              }
              else if(chap)
              {
                newPacket = {
                  code: "Access-Request",
                  secret: server.secret,
                  identifier:  Math.floor(Math.random() * (255-1)) + 1,
                  attributes: [
                    ['NAS-IP-Address', ip.address()],
                    ['User-Name', username],
                    ['CHAP-Password', packet.attributes['CHAP-Password']],
                    ['CHAP-Challenge', packet.authenticator]
                  ]
                }
              }

              var client = dgram.createSocket("udp4");

              client.bind(0);
              
              var response_count = 0;

              var encoded = radius.encode(newPacket);

              var sent_packets = [{
                raw_packet: encoded,
                secret: newPacket.secret
              }];

              client.on('message', function(msg, rinfo) {
                var response = radius.decode({packet: msg, secret: server.secret});
                var request = sent_packets[0];
                // although it's a slight hassle to keep track of packets, it's a good idea to verify
                // responses to make sure you are talking to a server with the same shared secret
                var valid_response = radius.verify_response({
                  response: msg,
                  request: request.raw_packet,
                  secret: request.secret
                });
                if (valid_response) {
                  if(response.code === 'Access-Accept')
                  {
                    logger.log('info', 'Got valid response ' + response.code + ' for packet id ' + response.identifier + ' for user ' + username + ' from RADIUS Server ' + server.ip);
                    logger.log('info', `RADIUS: User ${username} authenticated successfully`);
                    client.close();
                    authenticated = true;
                    if(isLast)
                      allServersFinished = true;
                    accept(response.raw_attributes, {});
                  }
                  else if(response.code === 'Access-Reject')
                  {
                    logger.log('error', `RADIUS: User ${username} with Password ${password} failed to authenticate`);
                    client.close();
                    if(isLast)
                    {
                      allServersFinished = true;
                      reject([], {});
                    }
                  }
                  else if(response.code === 'Access-Challenge')
                  {
                    logger.log('error', `RADIUS: User ${username} is requested with a RADIUS Challenge. Not yet implemented`);
                    logger.log('info',response.attributes);
                    client.close();
                    if(isLast)
                    {
                      allServersFinished = true;
                      reject([], {});
                    }
                  }
                  else
                  {
                    logger.log('error', `RADIUS: User ${username} with Password ${password} failed to authenticate`);
                    client.close();
                    if(isLast)
                    {
                      allServersFinished = true;
                      reject([], {});
                    }
                  }
                } else {
                  console.log('WARNING: Got invalid response ' + response.code + ' for packet id ' + response.identifier + ' for server ' + server.ip);
                  // don't take action since server cannot be trusted (but maybe alert user that shared secret may be incorrect)
                }
              
                if (++response_count == 3) {
                  client.close();
                  logger.log('error', `RADIUS: User ${username} with Password ${password} failed to authenticate`);
                  if(isLast)
                  {
                    allServersFinished = true;
                    reject([], {})
                  }
                }
              });

              client.send(encoded, 0, encoded.length, 1812, server.ip);
            });

            if(allServersFinished)
              logger.log('info', 'All RADIUS packets sent. Awaiting reply');

          }
        }
        else
        {
          logger.log('error', `RADIUS: User ${username} with Password ${password} failed to authenticate`);
          reject([], {})
        }
      }
      catch(err)
      {
        console.log(err);
      }
    }).on('Accounting-Request', function(packet:any, rinfo:any, respond:any) 
    {
      logger.log('info', packet);
      // catch all accounting-requests
      respond([], {})
    }).on('Accounting-Request-Start', function(packet:any, rinfo:any, respond:any) 
    {
      logger.log('info', packet);
      // or just catch specific accounting-request status types...
      respond([], {})
    }).on('Accounting-Request-Interim-Update', function(packet:any, rinfo:any, respond:any) 
    {
      logger.log('info', packet);
      respond([], {})
    }).on('Accounting-Request-Stop', function(packet:any, rinfo:any, respond:any) 
    {
      logger.log('info', packet);
      respond([], {})
    })

  }

  public chapMatch(cPassword, chapPassword, challenge) {
    let hash = chapPassword.slice(1);
    let md5 = crypto.createHash('md5');
    md5.write(chapPassword.slice(0, 1));
    md5.write(Buffer.from(cPassword));
    md5.write(challenge);
    let calc = md5.digest('hex');

    return hash.equals(Buffer.from(calc, 'hex'));
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
