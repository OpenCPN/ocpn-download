/*
 * ***************************************************************************
 *   Copyright (C) 2020 Alec Leamas                              *
 *                                                                         *
 *   This program is free software; you can redistribute it and/or modify  *
 *   it under the terms of the GNU General Public License as published by  *
 *   the Free Software Foundation; either version 2 of the License, or     *
 *   (at your option) any later version.                                   *
 *                                                                         *
 *   This program is distributed in the hope that it will be useful,       *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
 *   GNU General Public License for more details.                          *
 *                                                                         *
 *   You should have received a copy of the GNU General Public License     *
 *   along with this program; if not, write to the                         *
 *   Free Software Foundation, Inc.,                                       *
 *   51 Franklin Street, Fifth Floor, Boston, MA 02110-1301,  USA.         *
 ***************************************************************************
*/

/*
 * Web support for downloading OpenCPN plugins.
 *
 * A single-page application which uses a backend API to parse the plugin
 * catalog. User can select plugin, platform and version and eventually
 * download the plugin.
 *
 * Some background: https://github.com/OpenCPN/OpenCPN/issues/1839
 */

import React from 'react';
import { Card, Button, Form} from 'react-bootstrap';

import arrow from './triangle-right.png';

import './App.css';

const urlBase = "https://raw.githubusercontent.com/OpenCPN/plugins";

const urlByName = {
  "Master": urlBase + "/master/ocpn-plugins.xml",
  "Beta": urlBase + "/Beta/ocpn-plugins.xml",
  "Custom": ""
}

class Plugin {

  constructor(elem) {
    this.name = this.getElementByName(elem, 'name');
    this.version = this.getElementByName(elem, 'version');
    this.target = this.getElementByName(elem, 'target')
      + '-' + this.getElementByName(elem, 'target-version');
    this.tarball_url = this.getElementByName(elem, 'tarball-url');
  }

  getElementByName(e, name) {
    return e.getElementsByTagName(name)[0].textContent.trim();
  }


}

class Catalog {
  // The plugin database, reflecting the parsed ocpn-plugins.xml

  constructor() {
    this.getPlugins = this.getPlugins.bind(this);
    this.plugins = [];
  }

  init(responseXML) {
    const elements = Array.from(responseXML.getElementsByTagName('plugin'));
    this.plugins = elements.map(e => new Plugin(e));

    const p = responseXML.getElementsByTagName('plugins')[0];
    this.date = p.getElementsByTagName('date')[0].textContent.trim();

    var versions = Array.from( p.getElementsByTagName('version'));
    versions = versions.filter(v => v.parentNode === p);
    this.version = versions[0].textContent.trim();
  }

  getPlugins() {
    // Return list of available plugins
    return this.plugins.map(p => p.name);
  }


  getPlatforms(plugin) {
    // Return list of platforms (builds) for given plugin. The
    // platform names are "target OS-target OS version" tuples.

    return this.plugins.filter(p  => p.name === plugin).map(p => p.target);
  }

  getPluginVersions(plugin, platform) {
    // Get list of versions available for given plugin and platform.

    return this.plugins
      .filter(p => p.name === plugin && p.target === platform)
      .map(p => p.version);
  }

  getDownloadUrl(plugin, platform, vers) {
    // Return download url for given plugin, platform and version.

    const match = this.plugins.filter(
      p => p.name === plugin && p.target === platform && p.version === vers
    );
    return match.length === 1 ? match[0].tarball_url : "";
  }

  getVersion() { return this.version }

  getDate() { return this.date }

}

class Copyright extends React.Component {
  // Display the copyright info at bottom.

  constructor(props, context) {
    super(props, context);
    this.state = {'expanded': false };
  }

  render() {
    return (
      <div className="footer">
        <img src={arrow}
          className={this.state.expanded ? 'arrow-down' : 'arrow-right'}
          alt={this.state.expanded ? 'collapse' : 'expand'}
          onClick={(e) => {this.setState({expanded: !this.state.expanded})}}
        />
        &nbsp;
        Copyright and license
        <div style={{display: this.state.expanded ? 'block' : 'none'}}
          className="license">
Copyright {'\u00a9'} Alec Leamas 2020
<br/>
This program is free software. You can redistribute and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 3 of the License or, at your option, any later
version. Sources and license are available
<a href="https://github.com/leamas/ocpn-download"> here </a>

        </div>
      </div>
    );
  }
}


class CurrentCatalog extends React.Component {
  // Current catalog (at top) + optional details.

  constructor(props, context) {
    super(props, context);
    this.state = {'details': false };
    this.onCollapse = this.onCollapse.bind(this)
    this.onExpand = this.onExpand.bind(this)
  }

  onCollapse(event) {this.props.showSelectedCatalog(false)}
  onExpand(event) {this.props.showSelectedCatalog(true)}

  render() {
    const showCatalogs = this.props.showCatalogs;
    return (
      <div>
        <div className="current-catalog">
          <div className="details">
            <img src={arrow}
              className={this.state.details ? 'arrow-down' : 'arrow-right'}
              alt={this.state.details ? 'collapse' : 'expand'}
              onClick={(e) => {this.setState({details: !this.state.details})}} />
          </div>
          &nbsp; Current catalog: {this.props.selectedCatalog}
        </div>
        <div className="details-info"
          style={{display: this.state.details ? 'inline' : 'none'}} >
          <div> Last update: {this.props.date} </div>
        </div>
        <img src={arrow}
          className={showCatalogs ? 'arrow-down' : 'arrow-right'}
          alt={showCatalogs ? 'collapse' : 'expand'}
          onClick={showCatalogs ? this.onCollapse : this.onExpand} />
        &nbsp; More catalogs
      </div>
    )
  }
}


class CatalogSelect extends React.Component {
  // The select catalog radio buttons, initially hidden.

  constructor(props, context) {
    super(props, context);
    this.state=({
      showCatalogs: false,
    });
    this.showSelectedCatalog = this.showSelectedCatalog.bind(this);
    this.urlInput = React.createRef();
  }

  showSelectedCatalog(bool) { this.setState({showCatalogs: bool}); }

  handleOptionChange = changeEvent => {
    const option_msg =
      "Custom URL catalogs are not tested and carries a high risk\n" +
      "for bugs or even events destructive for your system.";
    if (changeEvent.target.id === "Custom") {
      alert(option_msg);
    }
    urlByName["Custom"] = this.urlInput.value
    this.props.onCatalogChange(changeEvent.target.id);
  };

  render() {
    const warning = <span style={{color: 'red'}}>{'\u2757'}</span>;
    const Custom = <div>{warning} Custom URL</div>;
    return (
      <div>
        <CurrentCatalog
          version={this.props.version}
          date={this.props.date}
          showCatalogs={this.state.showCatalogs}
          selectedCatalog={this.props.label}
          showSelectedCatalog={(b) => this.showSelectedCatalog(b)}
        />
        <div className="catalog-select"
          style={{display: this.state.showCatalogs ? 'block': 'none'}}>
          <Form className="catalog-select"
            style={{display: this.state.showCatalogs ? 'block': 'none'}}>
            <Form.Check
              type="radio" label="Master" id="Master"
              onChange={this.handleOptionChange}
              checked={this.props.label === 'Master'} />
            <Form.Check
              type="radio" label='Beta' id="Beta"
              onChange={this.handleOptionChange}
              checked={this.props.label === 'Beta'} />
            <div className="col-sm-12">
              <div className="row">
                <Form.Check
                  type="radio" label={Custom} id="Custom"
                  onChange={this.handleOptionChange}
                  checked={this.props.label === 'Custom'} />
              </div>
              <div className="row">
                <Form.Group controlId="custom-url-input" className="url-input">
                  <Form.Control
                    ref={input => { this.urlInput = input; }}
                    type="url"
                    placeholder="Enter url" />
                </Form.Group>
              </div>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}


class PluginSelect extends React.Component {
  // First drop-down: Select plugin from catalog

  componentDidMount() {
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.props.setPlugin(event.target.value);
  }

  render() {
    const options = [];
    options.push(
      <option key="255" value={''}>  Select a plugin </option>)
    if (this.props.plugins) {
      for (let i = 0; i < this.props.plugins.length; i += 1) {
        options.push(
          <option key={i} value={this.props.plugins[i]}>
            {this.props.plugins[i]}
          </option>)
      }
    }
    return (
      <Form.Group controlId="pluginSelect" onChange={this.onChange}>
        <Form.Label>Plugin</Form.Label>
        <Form.Control as="select"> {options} </Form.Control>
      </Form.Group>
    );
  }
}


class PlatformSelect extends React.Component {
  // Second drop-down: select platform (build) of selected plugin

  constructor(props, context) {
    super(props, context);
    this.platforms = [];
    if (props.platforms) {
      this.platforms = props.platforms;
    }
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.props.setPlatform(event.target.value);
  }

  getLabel(key) {
    if (key.startsWith('msvc')) {
      return 'Windows';
    }
    else if (key.startsWith('darwin')) {
      return 'MacOS';
    }
    else {
      return key;
    }
  }

  render() {
    let options = [];
    if (this.props.platforms.length > 0) {
      options.push(
        <option key="255" value={''}> Select a platform </option>)
    }
    for (let i = 0; i < this.props.platforms.length; i += 1) {
      options.push(
        <option key={i} value={this.props.platforms[i]}>
          {this.getLabel(this.props.platforms[i])}
        </option>)
    }
    return (
      <Form.Group controlId="platformSelect" onChange={this.onChange}>
        <Form.Label>Platform</Form.Label>
        <Form.Control as="select" value={this.props.platform} disabled={options.length < 1}>
          {options}
        </Form.Control>
      </Form.Group>
    );
  }
}


class VersionSelect extends React.Component {
  // Third drop-down: User selects version of selected build, often just one

  constructor(props, context) {
    super(props, context);
    this.versions = props.versions ? props.versions : [];
    this.onChange = this.onChange.bind(this);
    this.platformChangeCount = 0;
  }

  onChange(event) {
    this.props.setVersion(event.target.value);
  }

  render() {
    if (this.props.versions.length === 1
      && this.props.platformChangeCount > this.platformChangeCount)
    {
      this.props.setVersion(this.props.versions[0]);
      this.platformChangeCount = this.props.platformChangeCount
    }
    var options = [];
    var versions = this.props.versions;
    if (versions.length >= 2) {
      options.push(
        <option key={255} value={''}> Select a version </option>)
    }
    for (let i = 0; i < versions.length; i += 1) {
      options.push(
        <option key={i} value={versions[i]}>  {versions[i]} </option>)
    }
    return (
      <Form.Group controlId="versionSelect" onChange={this.onChange}>
        <Form.Label>Version</Form.Label>
        <Form.Control as="select" value={this.props.version}
          disabled={versions.length < 2}>
            {options}
        </Form.Control>
      </Form.Group>
    );
  }
}


function DownloadPlugin(props) {
  // The Download button.

  if (props.disabled) {
    return (
      <Button variant="secondary" href={props.url} disabled>
        Download
      </Button>
    );
  }
  else {
    return (
      <Button variant="primary" href={props.url}>
        Download
      </Button>
    );
  }
}


class App extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      'catalogLabel': 'Initiating...',
      'catalog':  new Catalog(),
      'plugins': [],
      'plugin': undefined,
      'platform': undefined,
      'version': undefined,
      'loading': true,
      'platformChangeCount': 1
    }
    this.parse = this.parse.bind(this);
    this.loadCatalog = this.loadCatalog.bind(this);
  }

  componentDidMount() {
    this.loadCatalog('Master');
  }

  loadCatalog(label) {
    this.setState({
      'catalogLabel': 'Loading...',
      'loading': true
    });
    this.parse(label, urlByName[label]);
  }

  parse(label, url){
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url);
    xhttp.send();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState === 4) {
        if (xhttp.status === 200) {
          var parser = new DOMParser();
          this.state.catalog.init(
            parser.parseFromString(xhttp.responseText, "text/xml")
          );
          this.setState({
            'catalogLabel': label,
            'plugins': this.state.catalog.getPlugins(),
            'loading': false
          });
        }
        else {
          console.log("Cannot download catalog " + label + " from " + url
                      + ", status: " + xhttp.statusText);
          this.setState({'catalogLabel': 'Cannot load catalog ' + label});
        }
      }
    }.bind(this);
  }

  setPlugin(plugin) {
    this.setState({
      'plugin': plugin,
      'platforms': this.state.catalog.getPlatforms(plugin)
    })
    this.setPlatform('')
  }

  setPlatform(platform) {
    this.setState({
      'platform': platform,
      'version': '',
      'platformChangeCount': this.state.platformChangeCount + 1
    });
  }

  setVersion(version) {
    this.setState({ 'version': version });
    this.url =
      this.state.catalog.getDownloadUrl(this.state.plugin, this.state.platform, version);
  }

  render() {
    const plugin = this.state.plugin;
    const platforms =
      plugin !== '' ? this.state.catalog.getPlatforms(plugin) : [];
    var versions = []
    if (this.state.platform) {
      versions =
        this.state.catalog.getPluginVersions(plugin, this.state.platform)
    }
    var url = '';
    if (this.state.version) {
      url = this.state.catalog.getDownloadUrl(
        plugin, this.state.platform, this.state.version);
    }
    return (
      <div className="app" style={{cursor: this.state.loading ? 'wait' : 'default'}}>
        <div className="container" >
          <header className="app-header">
            <p> OpenCPN Plugin Downloader </p>
          </header>
          <Card>
            <Card.Body>
              <CatalogSelect
                onCatalogChange={(label) => {this.loadCatalog(label)}}
                label={this.state.catalogLabel}
                version={this.state.catalog.getVersion()}
                date={this.state.catalog.getDate()}
              />
            </Card.Body>
          </Card>
          <div style={{  // disable all plugin selecting until catalog loaded
            pointerEvents: this.state.loading ? 'none': 'auto',
            opacity: this.state.loading ? 0.4 : 1.0
            }} >
            <Card>
              <Card.Body>
                <PluginSelect
                  plugin={this.state.plugin}
                  plugins={this.state.plugins}
                  setPlugin={(plugin) => {this.setPlugin(plugin)}}
                />
                <PlatformSelect
                  platform={this.state.platform}
                  platforms={platforms}
                  setPlatform={(platform) => {this.setPlatform(platform)}}
                />
                <VersionSelect
                  versions={versions}
                  platformChangeCount={this.state.platformChangeCount}
                  setVersion={(v) => this.setVersion(v)}
                />
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <DownloadPlugin url={url} disabled={url === ''}/>
              </Card.Body>
            </Card>
          </div>
          <Copyright/>
        </div>
      </div>
    );
  }
}

export default App;
