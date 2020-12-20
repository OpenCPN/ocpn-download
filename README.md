OpenCPN plugin downloader README
================================

This is a javascript frontend which enables OpenCPN[1] users to download
plugins.

The primary usecase is a user in a harbour without network access which
takes a laptop to a café in the vicinity, downloads the plugin, carries it
back and installs it.  Some background discussion is available in [2]


## Installation:

   $ git clone https://github.com/leamas/ocpn-download
   $ cd ocpn-download
   $ npm ci
   $ npm run build

The installation creates a directory build which can be served by a static
webserver like apache or nginx.

Note that the url the application is served under is hardcoded into the
homepage stanza in package.json. This needs to be patched in most
deployment scenarios.

Under apache, a symlink like
'/var/www/html/opencpn-dl -> /home/al/src/ocpn-download/build' works fine
to deploy the application under a sub-uri if the package.json
homepage matches it.

## License
Copyright (c) Alec Leamas 2020
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

See COPYING for exact terms and conditions.

[1] https://opencpn.org
[2] https://github.com/OpenCPN/OpenCPN/issues/1839
