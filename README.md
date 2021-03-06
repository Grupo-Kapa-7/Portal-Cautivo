# Portal Cautivo
Portal cautivo funcional con dispositivos Fortinet tanto para acceso de invitados (guest) como para autenticación LDAP en FortiOS 6.4.4+ mediante su REST API.

## Uso
El portal cautivo se divide en 2 modulos
### Backend
El backend esta escrito en Typescript utilizando [Loopback 4](https://loopback.io/) que hace lo siguiente:
* Registra y autenticacioón de usuarios tipo invitado/guest y mac address de los dispositivos para ser usados con una autenticación RADIUS por parte del controlador WiFi (el caso de Fortinet con portales cautivos externos)
* Autenticación LDAP para soportar las funcionalidades de FortiOS 6.4.4+ con su api en el endpoint '/api/v2/monitor/user/firewall/auth'
  - Verifica que el usuario exista en un directorio activo y comprueba sus credenciales antes de hacer login con el/los FortiGate(s) configurados 
* RADIUS Server integrado con soporte de autenticación PAP y CHAP (MS-CHAPv2 pendiente)
* RADIUS Proxy para hacer forwarding de la autenticacion a otro RADIUS Server 
* Logging de eventos via consola de programa, a archivos con log rotate y Syslog
* Configuración de X número de portales cautivos con diferentes saludos, logos y soporta dos tipos de autenticación por portal cautivo : 'ldap' o 'guest'
* Configuración de terminos y condiciones de uso por portal cautivo

#### *** El backend requiere que el archivo portalconfig.json este en el mismo directorio donde se ejecute el servicio para su configuración y correcto funcionamiento. Un archivo de muestra se encuentra en el raíz del repositorio. ***


Revisa la carpeta de captive-portal-backend para saber mas de su uso.

### Frontend
Escrito en Angular 11/NodeJS v14. Provee el portal cautivo que sera mostrado al usuario final. Muestra los campos de registro para los portales de tipo 'guest' o en su defecto si el usuario ya esta registrado mostrara un saludo y pedira que acepter unicamentes los terminos y condiciones de uso de la red. En caso de ser un portal tipo 'ldap' se le solicitara al usuario realizar login con sus credenciales LDAP y una vez autenticado en el/los FortiGate(s) se procede a mostrar un mensaje de bienvenida con una URL de redireccion al sitio una vez se tenga acceso a internet.

Revisa la carpeta de captive-portal-frontend para saber mas de su uso.

## Requisitos
* MySQL 8 con [autenticacion nativa](https://dev.mysql.com/doc/refman/8.0/en/native-pluggable-authentication.html) (Versiones menores no probadas)
* NodeJS v14+ + NPM
* Angular CLI v11
* Loopback 4
* NGINX o Apache2 (Opcional) Se provee un ejemplo si se desea usar con NGINX y con sus respectivos archivos de configuracion de nginx.conf y el sitio default en /etc/nginx/sites-available/default