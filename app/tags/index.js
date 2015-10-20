import path from 'path';
import {readdirSync} from 'fs';

export default function({nunjucks, app}) {
  const paths = readdirSync(__dirname);

  paths.forEach((fp) => {
    if (!/index/.test(fp)) {
      const tagName = path.basename(fp, path.extname(fp)).replace('-', '_');
      const Mod = require(`./${fp}`);
      nunjucks.addExtension(tagName, new Mod(app));
    }
  });
}
