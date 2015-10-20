import gulp from 'gulp';
import {tasks, config, plugins as $} from './gulp/config/make-gulp-config';

const {sources, utils} = config;
const {buildDir, testDir, taskDir} = sources;
const {addbase} = utils;

gulp.task('browser-sync', ['nodemon'], tasks.browserSync);
gulp.task('clean', tasks.clean);
gulp.task('lint:test', tasks.eslint);
gulp.task('lint:build', tasks.eslint);
gulp.task('lint', ['lint:test', 'lint:build']);
gulp.task('nodemon', tasks.nodemon);
gulp.task('webpack:global', tasks.webpack);
gulp.task('webpack:main', tasks.webpack);
gulp.task('webpack', ['webpack:main', 'webpack:global']);
gulp.task('karma', tasks.karma);

gulp.task('build', (cb) => {
  $.sequence(
    ['clean', 'lint'],
    'webpack',
    'browser-sync',
    cb
  );
});

gulp.task('test:integration', (cb) => {
  $.sequence(
    'lint',
    'karma',
    cb
  );
});

gulp.task('default', ['build']);

gulp.task('watch', ['build'], () => {
  gulp.watch(addbase(buildDir, '{js/,css/}**/*.{js,css}'), $.browserSync.reload);
  gulp.watch([
    addbase('app/**/*.js'),
    addbase(taskDir, '**/*.js'),
    addbase('gulpfile.babel.js'),
    addbase(testDir, '**/*.js')
  ], ['lint']);
});
