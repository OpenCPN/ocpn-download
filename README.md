OpenCPN plugin downloader README
================================

This is a javascript frontend which enables OpenCPN[1] users to download
plugins.

The primary usecase is a user in a harbour without network access which
takes a laptop to a café in the vicinity, downloads the plugin, carries it
back and installs it.  Some background discussion is available in [2]


## Installation:

   $ git clone https://github.com/leamas/ocpn-download
   $ npm ci
   $ npm run build

The installation creates a directory build which can be served by a static
webserver like apache or nginx.

Note that the default build assumes that the package is served at the root
directory. The build output has more info on this.


## License
Copyright (c) Alec Leamas 2020
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

See COPYING for exact terms and conditions.

[1] https://opencpn.org
[2] https://github.com/OpenCPN/OpenCPN/issues/1839
