import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, extensionFor} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  SECURITY_SCHEME_SPEC,
  UserRepository,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {MySequence} from './sequence';
import { MysqlDataSource } from './datasources';
import { AppUserService } from './services/user.service';
import { UserCredentialsRepository } from './repositories';
import {LoggingBindings, LoggingComponent, WinstonTransports, WINSTON_TRANSPORT} from '@loopback/logging';
import { format, LoggerOptions, transport } from 'winston';
import { extension } from 'mime';
const winstonModule = require('winston');
require('winston-daily-rotate-file');
require('winston-syslog').Syslog;
const fs = require('fs');

const portalConfig = JSON.parse(fs.readFileSync('portalconfig.json', {encoding: 'utf8'}));

export {ApplicationConfig};


export class CaptivePortalBackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    
    //Logging
    this.configure(LoggingBindings.COMPONENT).to({
      enableFluent: false, // default to true
      enableHttpAccessLog: true, // default to true
    });
    this.configure<LoggerOptions>(LoggingBindings.WINSTON_LOGGER).to({
      level: 'info',
      format: format.prettyPrint(),
      defaultMeta: {framework: 'LoopBack', dev: 'Grupo Kapa 7, San Pedro Sula, Honduras, Centroamérica'},
    });
    this.configure(LoggingBindings.WINSTON_HTTP_ACCESS_LOGGER).to({format: 'remote address :remote-addr - x-forwarded-for :req[x-forwarded-for] :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent :response-time ms"'});
    const consoleTransport = new WinstonTransports.Console({
      level: portalConfig.loggingOptions.defaultLevel,
      format: format.combine(format.colorize(), format.simple())
    });
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

    //Syslog Logging
    var syslogTransport = null;
    if(portalConfig.loggingOptions.syslogConfig.enabled)
    {
      console.log("Enabling Syslog");
      syslogTransport = new winstonModule.transports.Syslog({
        host : portalConfig.loggingOptions.syslogConfig.host,
        port : portalConfig.loggingOptions.syslogConfig.port,
        protocol : portalConfig.loggingOptions.syslogConfig.protocol,
        facility : portalConfig.loggingOptions.syslogConfig.facility,
        localhost : portalConfig.loggingOptions.syslogConfig.localhost,
        type : portalConfig.loggingOptions.syslogConfig.type,
        app_name : portalConfig.loggingOptions.syslogConfig.app_name,
        format: format.logstash()
      });

      this.bind('loggin.winston.transports.syslog').to(syslogTransport).apply(extensionFor(WINSTON_TRANSPORT));
    }

    this.bind('loggin.winston.transports.console').to(consoleTransport).apply(extensionFor(WINSTON_TRANSPORT));
    this.bind('loggin.winston.transports.file').to(fileTransport).apply(extensionFor(WINSTON_TRANSPORT));
    this.component(LoggingComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // Mount authentication system
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    // Bind datasource
    this.dataSource(MysqlDataSource, UserServiceBindings.DATASOURCE_NAME);
    // Bind user service
    this.bind(UserServiceBindings.USER_SERVICE).toClass(AppUserService),
    // Bind user and credentials repository
    this.bind(UserServiceBindings.USER_REPOSITORY).toClass(
      UserRepository,
    ),
    this.bind(UserServiceBindings.USER_CREDENTIALS_REPOSITORY).toClass(
      UserCredentialsRepository,
    )

  }
}
