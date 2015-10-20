import nunjucks from 'nunjucks';

export default class {
  constructor(app) {
    this.app = app;
    this.tags = ['get_snippet'];
  }

  parse(parser, nodes, lexer) {
    let tok = parser.nextToken();
    let args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  run(context, snippetName) {
    let view, content;

    try {
      view = this.app.snippets.getView(`components/${snippetName}`);
      content = view.content;
    } catch (err) {
      throw new Error(`No React snippet ${snippetName} on assemble context: ${err.message}`);
    }

    return new nunjucks.runtime.SafeString(content);
  }
}
