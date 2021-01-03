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

Installation requires a reasonably updated npm available, tested with
6.14.8

## Testing

    $ npm run start

Starts the test server on the local machine which could be accessed in a
browser on http://localhost:3000

## Installation

    $ set_homepage http://url.to.application/when/deployed
    $ npm run build

The installation creates a directory build/ which can be served by a static
webserver like apache or nginx. This will serve the application on a
specific url which must be known in advance and fed into *set_homepage*.

Under apache, a symlink like
'/var/www/html/opencpn-dl -> /home/al/src/ocpn-download/build' works fine
to deploy the application under a sub-uri if the `set_homepage` url
homepage matches it (and permissions are setup to allow web server access
to target directory).

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
