#!/usr/bin/env node

'use strict';

var fs = require('fs');
var untildify = require('untildify');
var dropbox = require('dropbox');
var nomnom = require('nomnom');

var shadowbox = require('./index.js');

var opts = nomnom
    .option('targetPath', {
        position: 0,
        default: '.',
        help: 'The path to examine.  Must be a directory in ~/Dropbox.  Defaults to $PWD.',
    })
    .help([
        'Your dropbox might hold files and directories which are not present on this device',
        'because they were excluded by Selective Sync.',
        'This command prints a list of all directories in targetPath, even excluded directories.',
    ].join('\n')+'\n')
    .parse();

// load secrets from config file
var configPath = untildify('~/.shadowbox');
if (!fs.existsSync(configPath)) {
    console.log([
        'Setup instructions:',
        '1. Create an app for yourself on the Dropbox App Console.',
        '   You can name it whatever you want; it will only be used by you.',
        '       https://www.dropbox.com/developers/apps',
        '2. On your app settings page, get a "Generated access token" for your account.',
        '3. Create a file at ~/.shadowbox which contains:',
        '   {',
        '     "key": "YOUR_APP_KEY",',
        '     "secret": "YOUR_APP_SECRET",',
        '     "token": "YOUR_GENERATED_ACCESS_TOKEN"',
        '   }',
    ].join('\n'));
    process.exit(1);
}
var secrets = JSON.parse(fs.readFileSync(configPath).toString());

var dbClient = new dropbox.Client(secrets);
shadowbox.ls(dbClient, opts.targetPath)
    .catch(function(err) {
        if (err.status == 404) {
            console.log('Directory does not exist.');
        } else if (err.status == 401) {
            console.log('Authorization failed.  Check your token value in ~/.shadowbox');
        } else {
            console.log(err.message);
        }
        process.exit(1);
    });
