module.exports = function (grunt) {

    grunt.initConfig({

        exec: {
            html: 'node ssi-html.js',
            scripts: 'node ssi-scripts.js'
        },

        less: {

            compile: {
                options: {
                    cleancss: false
                },
                files: {
                    "../dist/css/main.css": "../workspace/css/main.less",
					"../dist/css/bootstrap.min.css": "../workspace/css/bootstrap/bootstrap.less"
                }
            }
        },

        clean: {
            options: { force: true },
            dist: ['../dist'],
            html: ['../dist/*.html'],
            styles: ['../dist/css'],
            scripts: ['../dist/js'],
            fonts: ['../dist/fonts'],
            images: ['../dist/images']
        },

        copy: {
            styles: {
                expand: true,
                cwd: '../workspace/css/vendor/',
                src: ['**'],
                dest: '../dist/css/'
            },
            scripts: {
                expand: true,
                cwd: '../workspace/js/vendor/',
                src: ['**'],
                dest: '../dist/js/vendor/'
            },
            fonts: {
                expand: true,
                cwd: '../workspace/fonts/',
                src: ['**'],
                dest: '../dist/fonts'
            },
            images: {
                expand: true,
                cwd: '../workspace/images/',
                src: ['**'],
                dest: '../dist/images/'
            },
        },

        watch: {

            html: {
                files: ['../workspace/**/*.html'],
                tasks: ['clean:html', 'exec:html'],
                options: {
                    livereload: true,
                    spawn: false
                },
            },

            styles : {
                files: ['../workspace/css/**/*.*'],
                tasks: ['clean:styles', 'copy:styles', 'less:compile'],
                options: {
                    livereload: true,
                    spawn: false
                },
            },

            scripts : {
                files: ['../workspace/js/**/*.*'],
                tasks: ['clean:scripts', 'copy:scripts', 'exec:scripts'],
                options: {
                    livereload: true,
                    spawn: false
                },
            },

            fonts : {
                files: ['../workspace/fonts/**/*.*'],
                tasks: ['clean:fonts', 'copy:fonts'],
                options: {
                    livereload: true,
                    spawn: false
                },
            },

            images : {
                files: ['../workspace/images/**/*'],
                tasks: ['clean:images', 'copy:images'],
                options: {
                    livereload: true,
                    spawn: false
                },
            },
        },

        connect: {
            dev: {
                options: {
                    port: 8080,
                    base: '../dist',
                    livereload: true
                }
            }
        }

    });

    //Load Tasks
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    // Default Task is basically a rebuild
    grunt.registerTask('default', [
        'clean:dist',
        'exec:html',
        'copy:styles', 'less:compile',
        'copy:scripts', 'exec:scripts',
        'copy:fonts',
        'copy:images',
        'connect:dev',
        'watch'
    ]);

};