'use strict';

var fs = require('fs');
var path = require('path');
var untildify = require('untildify');
var chalk = require('chalk');
var Promise = require('bluebird');

var prefixColor = chalk.gray;
var dirColor = chalk.blue;
var ghostDirColor = chalk.cyan.bold;
var fileColor = chalk.yellow;
var ghostFileColor = chalk.yellow;

exports.ls = function(dbClient, targetPath, localDropboxRootPath) {
    /* Print a summary of which files are locally present and which are hidden
     * by Selective Sync.
     *      dbClient: an instance of the dropbox client with secrets already set
     *          e.g. new require('dropbox').Client(yourSecrets)
     *      targetPath: path to a directory in your local Dropbox directory
     *          e.g /Users/you/Dropbox/foo/bar
     *      localDropboxRootPath: path to your local Dropbox directory
     *          e.g /Users/you/Dropbox
     * Returns a promise which resolves when the summary has been printed.
     */

    localDropboxRootPath = localDropboxRootPath || untildify('~/Dropbox');

    // get path relative to dropbox directory
    targetPath = path.resolve(targetPath);
    if (targetPath.indexOf(localDropboxRootPath) !== 0) {
        return Promise.reject(new Error('Specify a directory in your Dropbox directory.'));
    }
    var targetPathRelToDropbox = targetPath.slice(localDropboxRootPath.length);
    if (targetPathRelToDropbox === '') { targetPathRelToDropbox = '/'; }

    Promise.promisifyAll(dbClient);
    return dbClient.authenticateAsync()
        .then(function() {
            if (!dbClient.isAuthenticated()) {
                throw new Error('Authentication failed.');
            }
            return dbClient.readdirAsync(targetPathRelToDropbox);
        }).spread(function(entryNames, dirStat, entryStats) {
            if (entryStats == undefined) {
                throw new Error('Specify a directory, not a file.');
            }
            if (entryStats.length == 0) {
                console.log('That directory is empty.');
                return;
            }

            // sort directories before files, and within that sort alphabetically
            entryStats.sort(function(a, b) {
                if (a.isFolder != b.isFolder) { return (a.isFolder < b.isFolder)*2-1; }
                return (a.path.toLowerCase() > b.path.toLowerCase())*2-1;
            });

            var nonGhostFilesArePresent = false;
            entryStats.forEach(function(entryStat) {
                var localFullPath = localDropboxRootPath + entryStat.path;
                var isGhost = !fs.existsSync(localFullPath);
                var color;
                if (entryStat.isFolder) {
                    color = isGhost ? ghostDirColor : dirColor;
                } else {
                    color = isGhost ? ghostFileColor : fileColor;
                }
                var prefix = isGhost ? '  [hidden]  ' : '            ';
                var suffix = entryStat.isFolder ? '/' : '';
                if (entryStat.isFolder || isGhost) {
                    console.log(prefixColor(prefix) + color(path.basename(entryStat.path) + suffix));
                } else {
                    nonGhostFilesArePresent = true;
                }
            });
            if (nonGhostFilesArePresent) {
                console.log(fileColor('            [and some files]'));
            }
        });
}
