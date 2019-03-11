module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['clean:dist', 'copy', 'jade', 'sass', 'autoprefixer', 'includes:javascript', 'connect', 'watch']);

  grunt.initConfig({
    clean: {
      options: {
        force: true
      },
      dist: ['dist'],
      libraries: ['dist/assets/libraries'],
      images: ['dist/assets/images']
    },
    jade: {
      compile: {
        options: {
          pretty: true
        },
        files: [{
          expand: true,
          cwd: 'source',
          src: ['*.jade'],
          dest: 'dist',
          ext: '.html'
        }]
      }
    },
    sass: {
      compile: {
        options: {
          noCache: true,
          sourcemap: 'none',
          style: 'expanded'
        },
        files: [{
          expand: true,
          cwd: 'source/styles',
          src: ['*.sass'],
          dest: 'dist/assets/styles',
          ext: '.css'
        }]
      }
    },
    autoprefixer: {
      dist: {
        options: {
          browsers: [
            "Android 2.3",
            "Android >= 4",
            "Chrome >= 20",
            "Firefox >= 24",
            "Explorer >= 8",
            "iOS >= 6",
            "Opera >= 12",
            "Safari >= 6"
          ]
        },
        files: [{
          expand: true,
          cwd: 'dist/assets/styles',
          src: ['*.css'],
          dest: 'dist/assets/styles',
          ext: '.css'
        }]
      }
    },
    includes: {
      javascript: {
        options: {
          includeRegexp: /^(\s*)@include\s+"(\S+)";\s*$/,
          silent: true
        },
        files: [{
          expand: true,
          cwd: 'source/scripts',
          src: '*.js',
          dest: 'dist/assets/scripts',
          ext: '.js'
        }]
      }
    },
    copy: {
      libraries: {
        expand: true,
        cwd: 'source/libraries',
        src: ['**'],
        dest: 'dist/assets/libraries'
      },
      images: {
        expand: true,
        cwd: 'source/images',
        src: ['**'],
        dest: 'dist/assets/images'
      }
    },
    watch: {
      jade: {
        files: ['source/**/*.jade'],
        tasks: ['jade'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      sass: {
        files: ['source/styles/**/*.sass'],
        tasks: ['sass', 'autoprefixer'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      javascript: {
        files: ['source/scripts/**/*.js'],
        tasks: ['includes:javascript'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      libraries: {
        files: ['source/libraries/**/*'],
        tasks: ['clean:libraries', 'copy:libraries'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      images: {
        files: ['source/images/**/*'],
        tasks: ['clean:images', 'copy:images'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8080,
          base: 'dist',
          livereload: true
        }
      }
    }
  });
};
