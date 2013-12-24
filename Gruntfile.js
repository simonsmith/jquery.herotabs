module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            build: {
                options: {
                    report: 'gzip',
                    preserveComments: 'some'
                },
                files: {
                    'dist/jquery.herotabs.min.js': 'dist/jquery.herotabs.js'
                }
            }
        },

        copy: {
            build: {
                files: {
                    'dist/jquery.herotabs.js': 'src/main.js'
                }
            }
        },

        watch: {
            copydist: {
                files: 'src/main.js',
                tasks: ['copy', 'usebanner']
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            build: ['src/main.js']
        },

        usebanner: {
            build: {
                options: {
                    position: 'top',
                    banner: [
                        '/*!',
                        ' * <%= pkg.name %>',
                        ' * version <%= pkg.version %>',
                        ' * Requires jQuery 1.7.0 or higher',
                        ' * <%= pkg.repository.url %>',
                        ' * @blinkdesign',
                        ' */\n'
                    ].join('\n')
                },
                files: {
                    'dist/jquery.herotabs.js': 'dist/jquery.herotabs.js'
                }
            }
        }
    });

    grunt.registerTask('default', [
        'jshint',
        'copy',
        'usebanner',
        'uglify'
    ]);
};
