import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom/server';

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default class Html extends Component {
  static propTypes = {
    assets: PropTypes.object,
    component: PropTypes.node
  }

  render() {
    const {assets, component} = this.props;
    const content = component ? ReactDOM.renderToString(component) : '';

    return (
      <html lang="en-us">
        <head>
          <meta charSet="utf-8"/>
          <script dangerouslySetInnerHTML={{__html: `window.userName="I load on the client";`}} />
          {Object.keys(assets.styles).map((style, key) =>
          <link href={assets.styles[style]} key={key} media="screen, projection"
            rel="stylesheet" type="text/css"/>
          )}
        </head>
        <body>
          <h1>Hello</h1>
          <div id="content" data-react dangerouslySetInnerHTML={{__html: content}}/>
          <script src={assets.javascript.vendors}/>
          <script src={assets.javascript.main}/>
        </body>
      </html>
    );
  }
}
