OpenCPN plugin downloader README
================================

A javascript frontend enabling OpenCPN [[1]]( https://opencpn.org) users
to download plugins.

The primary usecase is a user in a harbour without network access which
takes a laptop to a café in the vicinity, downloads the plugin, carries it
back and installs it. Some background discussion is available in 
[[2]](https://github.com/OpenCPN/OpenCPN/issues/1839)


## Installation:

    $ git clone https://github.com/leamas/ocpn-download
    $ cd ocpn-download
    $ npm ci

Installation requires a reasonably updated npm available, tested with
6.14.8


## Testing

    $ npm run start

Starts the test server on the local machine which could be accessed in a
browser on http://localhost:3000


## Build deployment dir.

The application must know the sub-uri it is deployed on, for example
*/opencpn-dl* when deployed on *http://mumin.crabdance.com/opencpn-dl*.
This is set using the `set_homepage` script:

    $ ./set_homepage  /opencpn-dl     # or whatever sub-uri used.

Then run

    $ npm run build

The build creates a directory `build/` which can be served by a static
webserver like apache or nginx. 


## Updating the deployed version.

To avoid glitches when updating and to handle permissions a symlink scheme
is used.

    /var/www/html/opencpn-dl -> /var/www/ocpn-download/current-deploy
    current-deploy -> deploy
  
`/var/www/ocpn-download` is the git clone. The `/var/www/html/opencpn-dl`
link is owned by the web server and never changed. The `current-deploy`
link lives in `/var/www/ocpn-download` with regular permissions. The
`deploy/` directory is a verbatim copy of the `build/` dir.

After creating a new version in `build/` the following can be used to make an
safe update:

    $ cd /var/www/ocpn-download
    $ ln -s build tmp
    $ mv -fT tmp current-deploy
    $ rm -rf deploy
    $ cp -ar build deploy
    $ ln -s deploy tmp
    $ mv -fT tmp current-deploy


## Technical

The application is a single-page javascript webpage built using React and
Node.js


## License
Copyright (c) Alec Leamas 2020
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

See COPYING for exact terms and conditions.

[1] https://opencpn.org

[2] https://github.com/OpenCPN/OpenCPN/issues/1839
