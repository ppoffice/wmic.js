const wmic = require('../lib/wmic')();

// wmic.alias('COMPUTERSYSTEM').list('full')

// wmic.alias('Process').get();
// wmic.alias('Process').get('Name', 'ProcessId');
// wmic.alias('Process').find(13108).list('full');
// wmic.alias('Process').find(13108).get('Name', 'ProcessId');
// wmic.alias('Process').where('name', 'like', '%cmd%').where('name', '!=', 'git-cmd.exe').call('terminate')//.then(console.log).catch(console.error);
//
// wmic.alias('Environment').create({'UserName': 'ppoffice', 'Name': 'EXAMPLE_ENV', 'VariableValue': 1});
// wmic.alias('Environment').where('Name = "PATH"').list();
// wmic.alias('Environment').where('Name', 'PATH').list();
// wmic.alias('Environment').where('VariableValue', '>', 1).list();
// wmic.alias('Environment').where('VariableValue', 'LIKE', '%Win32%').list();
// wmic.alias('Environment').where('VariableValue', 'IS NOT', null).orWhere('Name', 'Hello').list();
// wmic.alias('Environment')
//     .where('a', '1')
//     .where(function() {
//         this.where('b', 'IS NOT', '2').orWhere('c', 'LIKE', '%3%').orWhere(function() {
//             this.where('d', 4).where('e', 5)
//         })
//     }).orWhere('f', 6).get();
// wmic.alias('Environment').where('Name', 'EXAMPLE_ENV').set({'VariableValue': 3});
// wmic.alias('Environment').where('Name', 'EXAMPLE_ENV').delete();
//
// wmic.alias('NICCONFIG').where('IPEnabled', true).where('DHCPEnabled', false).list('system');
// wmic.alias('NICCONFIG').where('IPEnabled', true).where('DHCPEnabled', false).call('SetWINSServer', "192.168.254.100", "192.168.254.101");
// wmic.alias('NICCONFIG').where('IPEnabled', true).where('DHCPEnabled', false).call('SetDNSServerSearchOrder', ["192.168.254.100", "192.168.254.101"]);