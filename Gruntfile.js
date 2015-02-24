module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jasmine: {
      test: {
        src: 'dist/jquery.herotabs.js',
        options: {
          vendor: [
            'bower_components/jquery/jquery.js',
            'bower_components/modernizr/modernizr.js',
            'bower_components/jasmine-jquery/lib/jasmine-jquery.js'
          ],
          specs: 'tests/*-spec.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', [
    'jasmine'
  ]);
};
