import React from 'react';
import { Card, Button, Form} from 'react-bootstrap';

import down from './triangle-down.png';
import right from './triangle-right.png';

import './App.css';

const token =
  '9138fef391ee4106c0e5c512f732dc51ea34a21487e1a731305e92b0073963f2';
const API_base= 'https://squidd.io:443/apps/v1/api/ocpn_plugins/catalogs';
const API_params = 'catalog=master&plugin=all&access_token=' + token;
const API_url = API_base + '?' + API_params;

const urlBase = "https://raw.githubusercontent.com/OpenCPN/plugins";

const urlByName = {
  "Master": urlBase + "/master/ocpn-plugins.xml",
  "Beta": urlBase + "/Beta/ocpn-plugins.xml",
  "Custom": ""
}

/*
 * The plugin database, reflecting the parsed ocpn-plugins.xml
 */
class Catalog {

  constructor() {
    this.parse = this.parse.bind(this);
  }

  parse(label, url, onLoaded, onError){
    const api = API_url.replace('master', url);
    fetch(api)
      .then(res => res.json())
      .then(res => {
        this.state = {'ok':true, 'label': label};
        this.data  = JSON.parse(JSON.stringify(res));
        if ('errors' in this.data) {
          console.log('Error fetching catalog: ' + this.data['errors']);
          onError(label, url, this.data['errors']);
        }
        else {
          onLoaded(label, this.getPlugins());
        }
      })
      .catch((error) => {
          console.log("Cannot dowload catalog " + label + " from " + url);
          onError(label, url, String(error));
      })
  }

  // Return list of available plugins
  getPlugins() {
    if (!this.data) {
      return [];
    }
    const keys = Object.keys(this.data);
    const ix = keys.indexOf('attribs');
    if (ix !== -1) {
      keys.splice(ix, 1);
    }
    return keys;
  }

  // Return list of platforms (builds) for given plugin. The
  // platform names are "target OS-target OS version" tuples.
  //   - 'darwin' is represented as 'MacOS',
  //   - msvc builds as 'Windows-10'
  getPlatforms(plugin) {
    if (!this.data) {
      return [];
    }
    if (Object.keys(this.data).indexOf(plugin) === -1 ) {
      return [];
    }
    var platforms = Object.keys(this.data[plugin].platforms);
    platforms = platforms.map(p => {
      return p;
/***
      if (p.startsWith('darwin')) {
        //return 'MacOS-' + p.split('-', 1)[1];
      }
      else if (p.startsWith('msvc')) {
        //return 'Windows-10';
      }
      else {
        return p;
      }
**/
    });
    return platforms;
  }

  // Get list of versions available for given plugin and platform.
  getPluginVersions(plugin, platform) {
    const platforms = this.getPlatforms(plugin);
    if (platforms.indexOf(platform) === -1 ) {
      return []
    }
    return Object.keys(this.data[plugin]["platforms"][platform]);
  }

  // Return download url for given plugin, platform and version.
  getDownloadUrl(plugin, platform, version) {
    const versions = this.getPluginVersions(plugin, platform);
    if (!versions) {
      return undefined;
    }
    if (versions.indexOf(version) === -1) {
      return undefined;
    }

    return this.data[plugin]["platforms"][platform][version]["tarball_url"];
  }

  getAttribute(attr) {
    if (!this.data) {
      return ""
    }
    if (Object.keys(this.data).indexOf('attribs') === -1) {
      return "?";
    }
    if (Object.keys(this.data['attribs']).indexOf(attr) === -1) {
      return "??"
    }
    return this.data['attribs'][attr];
  }

  getVersion() { return this.getAttribute('version') }

  getDate() { return this.getAttribute('date') }

}


class CurrCatalogComp extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {'details': false };
    this.onCollapse = this.onCollapse.bind(this)
    this.onExpand = this.onExpand.bind(this)
  }

  onCollapse(event) {this.props.showSelectedCatalog(false)}
  onExpand(event) {this.props.showSelectedCatalog(true)}

  render() {
    this.details = (
      <div className="details">
        <img src={right}
          className={this.state.details ? 'arrow-down' : 'arrow-right'}
          alt={this.state.details ? 'collapse' : 'expand'}
          onClick={(e) => {this.setState({details: !this.state.details})}} />
      </div>
    );
    const showCatalogs = this.props.showCatalogs;
    return (
      <div>
        <div className="current-catalog">
          {this.details} &nbsp; Current catalog: {this.props.selectedCatalog}
        </div>
        <div className="details-info"
          style={{display: this.state.details ? 'inline' : 'none'}} >
          <div> Version: {this.props.version} </div>
          <div> Last update: {this.props.date} </div>
        </div>
        <img src={right}
          className={showCatalogs ? 'arrow-down' : 'arrow-right'}
          alt={showCatalogs ? 'collapse' : 'expand'}
          onClick={showCatalogs ? this.onCollapse : this.onExpand} />
        &nbsp; More catalogs
      </div>
    )
  }
}


class CatalogSelect extends React.Component {

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
        <CurrCatalogComp
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
            <div className="row">
              <div className="col-sm-4">
                <Form.Check
                  type="radio" label={Custom} id="Custom"
                  onChange={this.handleOptionChange}
                  checked={this.props.label === 'Custom'} />
              </div>
              <div className="col-sm-8">
                <Form.Group controlId="custum-url-input">
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

  constructor(props, context) {
    super(props, context);
    this.platforms = [];
    if (props.platforms) {
      this.platforms = JSON.parse(props.platforms);
    }
    this.onChange = this.onChange.bind(this);
  }


  onChange(event) {
    this.props.setPlatform(event.target.value);
  }

  render() {
    let options = [];
    let platforms = JSON.parse(this.props.platforms);
    if (platforms.length > 0) {
      options.push(
        <option key="255" value={''}> Select a platform </option>)
    }
    for (let i = 0; i < platforms.length; i += 1) {
      options.push(
        <option key={i} value={platforms[i]}> {platforms[i]} </option>)
    }
    return (
      <Form.Group controlId="platformSelect" onChange={this.onChange}>
        <Form.Label>Platform</Form.Label>
        <Form.Control as="select" value={this.props.platform}>
          {options}
        </Form.Control>
      </Form.Group>
    );
  }
}


class VersionSelect extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.versions =  props.versions ? props.versions : [];
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
    let options = [];
    let versions = this.props.versions;
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
        <Form.Control as="select" value={this.props.version}>
          {options}
        </Form.Control>
      </Form.Group>
    );
  }
}


function DownloadPlugin(props) {
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
    this.onLoaded = this.onLoaded.bind(this);
    this.loadError = this.loadError.bind(this);
  }

  componentDidMount() {
    this.loadCatalog('Master');
  }

  loadCatalog(label) {
    const catalog = new Catalog();
    this.setState({
      'catalog': catalog,
      'catalogLabel': 'Loading...',
      'loading': true
    });
    catalog.parse(label, urlByName[label], this.onLoaded, this.loadError);
  }

  onLoaded(label, plugins) {
    this.setState({
      'catalogLabel': label,
      'plugins': plugins,
      'loading': false
    });
    if (!this.catalog) {
      return;
    }
  }

  loadError(label, url) {
    console.log('Cannot load catalog ' + label + ' from ' + url);
    this.setState({ 'catalogLabel': 'Cannot load catalog ' + label});
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
    var platforms = '[]';
    if (plugin !== '') {
      platforms = JSON.stringify(this.state.catalog.getPlatforms(plugin))
    }
    var versions = '[]'
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
      <div className="App">
        <div className="container">
          <header className="app-header">
            <p> OpenCPN Plugin Downloader </p>
          </header>
          <Card className="ocpn-card">
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
            <Card className="ocpn-card">
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
            <Card className="ocpn-card">
              <Card.Body>
                <DownloadPlugin url={url} disabled={url === ''}/>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
