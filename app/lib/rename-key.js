import path from 'path';

export default function(fp) {
  const dirname = path.dirname(fp).split(path.sep).slice(-1)[0];
  const basename = path.basename(fp, path.extname(fp));
  return path.join(dirname, basename);
}
