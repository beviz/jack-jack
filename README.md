# Download

[https://github.com/beviz/jack-jack/releases]()

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
  - name: gost 8080
    command: gost.exe -L=http://:8080 =F=https://name:pwd@host:port -D
    tags: https proxy
    autorun: win32
```
