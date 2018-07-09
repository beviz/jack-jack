Manage and run your common commands in one place. Cross-platform, based on [Electron](http://electron.atom.io).

[Download](https://github.com/beviz/jack-jack/releases)

Example config yaml:

```
# mode: specify effect for other commands of same config file
#   - conflict:
#       when one command has been started, others will be stopped
#   - union:
#       when one command has been started or stopped, others will be started or stopped
#
# autorun: auto run command when app started
#   - all: for all platforms
#   - `aix darwin freebsd linux openbsd sunos win32`, split by spaces
#
# platform: hide commands expect specify platforms
#   - all: for all platforms
#   - `aix darwin freebsd linux openbsd sunos win32`, split by spaces
#
# dir: default command work directory
#
# commands: commands array

mode: conflict
dir: '~'
platform: win32 darwin
commands:
  - name: gost proxy for host 1
    command: gost.exe -L=http://:8080 =F=https://name:pwd@host1:port -D
    tags: https proxy
    autorun: win32
  - name: gost proxy for host 2
    command: gost.exe -L=http://:8080 =F=https://name:pwd@host2:port -D
    tags: https proxy
    dir: ~/host2
```

TODO:
 - beatify UI
 - grouping display
 - input commands
 - edit commands
