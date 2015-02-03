# shadowbox

Show directories you've hidden using Dropbox Selective Sync.

Dropbox has a feature called Selective Sync that lets you remove directories from your device but keep them in the cloud and on other devices.  It's easy to forget that these hidden directories exist.  This command line script provides an easy way to check for hidden directories.

### Usage

```
$ ls ~/Dropbox

music/
txt/

$ shadowbox ~/Dropbox

            music/
  [hidden]  photos/
            txt/
```

### Setup

1. Create a Dropbox API app for yourself on the [Dropbox App Console](https://www.dropbox.com/developers/apps).  Give it full access to your whole Dropbox.  You can name it whatever you want; it will only be used by you.

2. On your app settings page, get a "Generated access token" for your account.

3. Create a file at `~/.shadowbox` which contains:
```
{
  "token": "YOUR_GENERATED_ACCESS_TOKEN"
}
```
