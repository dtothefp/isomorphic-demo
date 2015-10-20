import path from 'path';

export default function(fp) {
  const dirname = path.dirname(fp).split('/').slice(-1)[0];
  const basename = path.basename(fp).split('.').slice(0)[0];
  return path.join(dirname, basename);
}
