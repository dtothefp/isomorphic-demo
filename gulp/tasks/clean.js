export default function(gulp, plugins, config) {
  const {del} = plugins;
  const {sources, utils} = config;
  const {buildDir, srcDir} = sources;
  const {addbase} = utils;

  const src = [
    addbase(srcDir, '**/*-stats.json'),
    addbase(buildDir)
  ];

  return () => {
    return del(src);
  };
}

