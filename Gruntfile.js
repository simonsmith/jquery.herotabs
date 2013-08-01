module.exports = function(grunt) {
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
        'copy',
        'usebanner',
        'uglify'
    ]);

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-banner');
};
