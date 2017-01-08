# Wmic.js

A Node.js fluent interface to Windows Management Instrumentation CLI(WMIC).

## Getting Started

### Prerequisites

Typically WMI service is enabled on your Windows OS. If not, please 
use the following commands to start the service:

```cmd
sc start winmgmt // Start WMI Service
sc query winmgmt // Check if the service is running
```

If you are using wmic.js connecting to a remote machine, please make 
sure wmi firewall settings enabled:

```cmd
netsh advfirewall firewall set rule group="windows management instrumentation (wmi)" new enable=yes
```

### Installing

```cmd
npm install wmic-js
```

And import it:

```javascript
const wmic = require('wmic-js');
```

## Usage

The goal of wmic.js is to provide a JavaScript interface to WMIC 
and make it delight for you to run WMIC commands and get the result. 
Wmic.js supports most of the WMIC features, including all of the 
alias, class and path, and verbs like `get`, `set`, `list`, `call`, `create` 
and `delete`. 
> For more information about wmic, please run this command:
> ```cmd
> wmic /?
> ```

### Initialize

Firstly, you need to use wmic object to create a Query:

```javascript
wmic();
// Or
wmic(options);
```
#### Options
`options` object is optional for defining WMIC global switches, 
WMIC executable path and WMIC commands handler. Default option values 
are listed below:
```javascript
const defaultOptions = {
    // Supported global switches
    role: null,
    node: null,
    user: null,
    password: null,
    failfast: null,
    implevel: null,
    authlevel: null,
    namespace: null,
    privileges: null,
    
    // WMIC executable path
    binary: 'wmic',
    
    // Result encoding, only used in WMIC built-in command handler
    encoding: null,
    
    // WMIC commands handler
    exec: function(command) {
        // built-in handler
    }
};
```
### Commands
Next, you need to specify an command for the query. There are four 
types of command: `alias`, `class`, `path` and `context` corresponding
to the WMIC commands. You can directly call one of them after `wmic()`:
```javascript
// Specify query command by `alias`, `class` or `path`
wmic().alias(friendlyName);
wmic().class(className);
wmic().path(path);
// Or get the current WMIC context and stop right here
wmic().context();
```
Here are some examples:
```javascript
wmic().alias('Environment');
wmic().class('StdRegProv');
wmic().path('StdRegProv');
```
### Where/orWhere Clause
WMI uses a subset of SQL named Windows Management Instrumentation Query 
Language(WQL). Wmic.js support the `where`/`orWhere` clause to limit query 
results. The `where`/`orWhere` method takes in either two or three parameters, 
or a closure for nested where conditions:
```javascript
wmic().alias('NICConfig').where('Index', 1);
// Equals to
wmic().alias('NICConfig').where('Index', '=', 1);
// You can also use other operators
wmic().alias('NICConfig').where('Description', 'LIKE', '%WAN%');
// Use orWhere to give an alternative condition
wmic().alias('NICConfig').where('Description', 'LIKE', '%WAN%').orWhere('Description', 'LIKE', '%LAN%');
```
Please use closure to get complex where clause:
```javascript
wmic().alias('Environment').where(function() {
    this.where('Name', 'A').where('VariableValue', 1);
}).orWhere(function() {
    this.where('Name', 'B').where('VariableValue', 2);
});
```
This is equal to
```cmd
wmic Environment WHERE '(Name="A" AND VariableValue=1) OR (Name="B" AND VariableValue=2)'
```
#### find(pWhere)
Wmic.js also provides an extra verb `find` for you to specify pWhere conditions 
easily:
```javascript
wmic().alias(friendlyName).find(pWhereValue);
```
Here's an example:
```javascript
wmic().alias('NICConfig').find(1);
// Same as
wmic().alias('NICConfig').where('Index', 1);
```
> For aliases and their supported pWhere fields, please use this command:
> ```cmd
> wmic ALIAS /?
> ```

### Verbs
Wmic.js supports `get`, `set`, `list`, `call`, `create` and `delete` to fetch 
information in JSON format or apply changes. **Wmic.js uses Promises to pass 
results**.
#### get(...fieldNames)
Get certain fields or all fields of some WMI objects. `fieldNames` is optional.
```javascript
wmic().alias('NICConfig').find(1).get('Description').then(console.log);
// [
//      {
//          Description: 'VirtualBox Host-Only Ethernet Adapter #2'
//      }
// ]
// Or get all fields
wmic().alias('NICConfig').find(1).get().then(console.log);
// [
//     {
//         ArpAlwaysSourceRoute: null,
//         ArpUseEtherSNAP: null,
//         Caption: '[00000001] VirtualBox Host-Only Ethernet Adapter',
//         DatabasePath: '%SystemRoot%\\System32\\drivers\\etc',
//         ...
//     }
// ]
```
> To get more information about field names, please run this command:
> ```cmd
> wmic [alias|class SOMECLASS|path SOMEPATH] GET /?
> ```

#### list(format)
A short cut to `get(...fieldNames)`, `format` can be `BRIEF`, `FULL`, `SYSTEM`, 
etc.
```javascript
wmic().alias('NICConfig').find(1).list('BRIEF').then(console.log);
// [
//     {
//         "Description": "VirtualBox Host-Only Ethernet Adapter #2",
//         "DHCPEnabled": "FALSE",
//         "DNSDomain": null,
//         "Index": "1",
//         "ServiceName": "VBoxNetAdp"
//     }
// ]
```
> To get more information about formats, please run this command:
> ```cmd
> wmic [alias|class SOMECLASS|path SOMEPATH] LIST /?
> ```

#### create(parameter)
Create a resource using giving fields and values. The `parameter` is an object
whose key is field name and value is field value. Here is an example for creating
an environment variable for current user:
```javascript
wmic().alias('Environment').create({
    'UserName': '%USERDOMAIN%\\%USERNAME%', 
    'Name': 'EXAMPLE_ENV', 
    'VariableValue': 1
}).then(console.log);
// null
```
> To get more information about create action, please run this command:
> ```cmd
> wmic [alias|class SOMECLASS|path SOMEPATH] CREATE /?
> ```

#### set(parameter)
Modify resources using giving fields and values. The `parameter` is similar to
the one in `create(parameter)`. **PLEASE USE WHERE TO SELECT THE RESOURCES THAT 
YOU WANT TO SET**.
```javascript
wmic().alias('Environment').where('Name', 'EXAMPLE_ENV').set({
    'VariableValue': 2
}).then(console.log);
// null
```
> To get more information about set action, please run this command:
> ```cmd
> wmic [alias|class SOMECLASS|path SOMEPATH] SET /?
> ```

#### delete()
Delete resources. **PLEASE USE WHERE TO SELECT THE RESOURCES THAT YOU WANT TO 
DELETE**.
```javascript
wmic().alias('Environment').where('Name', 'EXAMPLE_ENV').delete().then(console.log);
// null
```
> To get more information about delete action, please run this command:
> ```cmd
> wmic [alias|class SOMECLASS|path SOMEPATH] DELETE /?
> ```

#### call(method, ...parameters)
Call a WMI method on WMI objects.
```javascript
// Set your operating system's time
const DateTime = require('wmic-js').Types.DateTime;
wmic().alias('OS').where('SerialNumber', '00000-00000-00000-00000')
    .call('SetDateTime', new DateTime(new Date()))
    .then(console.log);
// { ReturnValue: 0 }

// Check registry key access
const UInt32 = require('wmic-js').Types.UInt32;
const KEY_QUERY_VALUE = new UInt32(1);
const HKEY_LOCAL_MACHINE = new UInt32(2147483650);
wmic.class('StdRegProv').call('CheckAccess', HKEY_LOCAL_MACHINE, "SYSTEM\\CurrentControlSet", KEY_QUERY_VALUE)
    .then(console.log);
// { bGranted: true, ReturnValue: 0 }
```
> To get more information about call action, please run this command:
> ```cmd
> wmic [alias|class SOMECLASS|path SOMEPATH] CALL /?
> ```

### Other things you should know...

* The `context` command will directly return a Promise containing WMIC running context:
  ```javascript
  wmic().context().then(console.log);
  // {
  //     "NAMESPACE": "root\\\\cimv2",
  //     "ROLE": "root\\\\cli",
  //     "NODE(S)": "HOMEPC",
  //     "IMPLEVEL": "IMPERSONATE",
  //     ...
  // }
  ```
  
* Wmic.js will detect your system's encoding(actually code page), so under most occasions 
you don't need to specify `encoding` option for `wmic()`. But you may do this if you are 
sure about the system's encoding and need a better performance.

* Many WMIC commands needs to be called under administrator privileges, you can use 
third-party packages like [sudo-prompt](https://www.npmjs.com/package/sudo-prompt) to 
provide such executing environment and override default execution handler:
  ```javascript
  const elevate = require('sudo-prompt').exec;
  const extract = require('wmic-js').extract;
  wmic({ exec: function(command) {
      return new Promise(function(resolve, reject) {
          elevate(command, {
              encoding: 'utf-8',
              maxBuffer: 10 * 1024 * 1024
          }, function(error, stdout, stderr) {
              // Decode with stdout and extract information using #extract(text)
          })
      })
  }})
  ```
  Please refer to [test/elevate.js](./test/elevate.js) for more information.

* You can use `node` global switch to execute same WMI commands on different machines at
the same time, machine(node) names will be attached to the results:
  ```javascript
  wmic({ node: [ '127.0.0.1', 'localhost' ] }).alias('os').list().then(console.log);
  // [
  //     {
  //         "node": "127.0.0.1",
  //         "result": [
  //             {
  //                 "BuildNumber": "14393",
  //                 "Organization": "",
  //                 "SystemDirectory": "C:\\WINDOWS\\system32",
  //                 ...
  //             }
  //         ]
  //     },
  //     {
  //         "node": "HOMEPC",
  //         "result": [...]
  //     }
  // ]
  ```

## Deployment

### Test
```cmd
npm test
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/ppoffice/wmic.js/tags). 

## Authors

* **PPoffice** - *Initial work* - [PPOffice](https://github.com/ppoffice)

See also the list of [contributors](https://github.com/ppoffice/wmic.js/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
