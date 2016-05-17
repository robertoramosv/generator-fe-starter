/*jslint node: true */
/*globals grunt*/

module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);

    grunt.initConfig({
        config: {
            'port': 9001,
            'port_prod': 9002,
            'base': 'build'
        },

        dirs: {
            'app': 'app',
            'app_css': '<%= dirs.app %>/css',
            'app_css_site': '<%= dirs.app_css %>/site',
            'app_css_vendor': '<%= dirs.app_css %>/vendor',
            'app_js': '<%= dirs.app %>/js',
            'app_js_site': '<%= dirs.app_js %>/site',
            'app_js_vendor': '<%= dirs.app_js %>/vendor',
            'app_images': '<%= dirs.app %>/images',
            'app_fonts': '<%= dirs.app %>/fonts',
            'build': 'build',
            'build_js': '<%= dirs.build %>/js',
            'build_css': '<%= dirs.build %>/css',
            'build_images': '<%= dirs.build %>/images',
            'build_fonts': '<%= dirs.build %>/fonts',
            'tmp': '.tmp'
        },

        // Clean folders
        clean: {
            build: ['<%= dirs.build %>'],
            tmp: ['<%= dirs.tmp %>']
        },

        // JavaScript Code Sniffer, Code Syntax Verifier Tool */
        jscs: {
            all: {
                options: {
                    standard: 'Idiomatic',
                    reportFull: true
                },
                files: {
                    src: [
                        'Gruntfile.js',
                        '<%= dirs.app_js_site %>'
                    ]
                }
            }
        },

        // JSLint, Code Quality Tool
        jslint: {
            all: {
                options: {},
                directives: grunt.file.readJSON('.jslintrc'),
                src: [
                    'Gruntfile.js',
                    '<%= dirs.app_js_site %>/{,*/}*.js'
                ]
            }
        },

        // HTML Hint Code Verifier
        htmlhint: {
            options: {
                htmlhintrc: '.htmlhintrc'
            },
            templates: {
                src: [
                    '<%= dirs.app %>/*.html',
                    '<%= dirs.app_site_js %>{,*/}*template.html'
                ]
            }
        },

        /* Copy, for Images, Fonts, Data and IE CSS Behavior Files (.htc) */
        copy: {
            images: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= dirs.app %>/images',
                        src: '{,*/}*',
                        dest: '<%= dirs.build %>/images'
                    }
                ]
            },
            fonts: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= dirs.app %>/fonts',
                        src: '{,*/}*',
                        dest: '<%= dirs.build %>/fonts'
                    }
                ]
            },
            htmls: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= dirs.app %>',
                        dest: '<%= dirs.build %>',
                        src: ['*.html']
                    }
                ]
            }
        },

        // File Concatenation for JavaScript files
        concat: {
            js: {
                files: {
                    '<%= dirs.build_js %>/libraries.js': [
                        '<%= dirs.app_js_vendor %>/angular/angular.min.js'
                    ],
                    '<%= dirs.build_js %>/site.js': [
                        '<%= dirs.app_js_site %>/{,*/}*.module.js',
                        '<%= dirs.app_js_site %>/{,*/}*.*.js',
                        '<%= dirs.tmp %>/templates-angular.js',
                        '<%= dirs.app_js_site %>/app*.js'
                    ]
                }
            },
            css: {
                files: {
                    '<%= dirs.build_css %>/site.css': [
                        '<%= dirs.app_css_site %>/{,*/}*.css'
                    ],
                    '<%= dirs.build_css %>/libraries.css': [
                        '<%= dirs.app_css_vendor %>/{,*/}*.css'
                    ]
                }
            }
        },

        // Angular Templates Compiler (HTML to JS)
        ngtemplates: {
            templates: {
                options: {
                    module: 'fesg.templates',
                    prefix: '',
                    standalone: true,
                    htmlmin: {
                        removeComments: true,
                        collapseWhitespace: true
                    }
                },
                cwd: '<%= dirs.app_js_site %>',
                src: '{,*/}*template.html',
                dest: '<%= dirs.tmp %>/templates-angular.js'
            }
        },

        // AngularJS DI Annotation
        ngAnnotate: {
            dist: {
                files: {
                    '<%= dirs.build_js %>/site.js': ['<%= dirs.build_js %>/site.js']
                }
            }
        },

        // CSS Minimizer
        cssmin: {
            options: {
                compatibility: 'ie8'
            },
            css: {
                files: [{
                    expand: true,
                    cwd: '<%= dirs.build_css %>',
                    src: ['{,*/}*.css', '!{,*/}*.min.css'],
                    dest: '<%= dirs.build_css %>',
                    ext: '.min.css'
                }]
            }
        },

        // JavaScript Minimizer
        uglify: {
            options: {
                screwIE8: false
            },
            js: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= dirs.build_js %>',
                        src: ['{,*/}*.js', '!{,*/}*.min.js'],
                        dest: '<%= dirs.build_js %>',
                        ext: '.min.js'
                    }
                ]
            }
        },

        // Connect server
        connect: {
            options: {
                keepalive: true,
                hostname: 'localhost',
                base: '<%= config.base %>'
            },
            livereload: {
                options: {
                    keepalive: false,
                    livereload: 35729,
                    port: '<%= config.port %>',
                    open: {
                        target: 'http://localhost:<%= config.port %>/'
                    }
                }
            },
            prod: {
                options: {
                    port: '<%= config.port_prod %>',
                    open: {
                        target: 'http://localhost:<%= config.port_prod %>/'
                    }
                }
            }
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            options: {
                livereload: true
            },
            js: {
                files: [
                    'Gruntfile.js',
                    '<%= dirs.app_js_site %>/{,*/}*.js',
                    '<%= dirs.app_js_site %>/{,*/}*.js',
                    '<%= dirs.app_js_vendor %>/{,*/}*.js'
                ],
                tasks: ['build:js']
            },
            css: {
                files: [
                    '<%= dirs.app_css_site %>/{,*/}*.css',
                    '<%= dirs.app_css_vendor %>/{,*/}*.css'
                ],
                tasks: ['build:css']
            },
            images: {
                files: [
                    '<%= dirs.app %>/images/{,*/}*.*'
                ],
                tasks: ['copy:images']
            },
            fonts: {
                files: [
                    '<%= dirs.app %>/fonts/{,*/}*.*'
                ],
                tasks: ['copy:fonts', 'build:js']
            },
            htmls: {
                files: [
                    '<%= dirs.app %>/*.html'
                ],
                tasks: ['build:htmls']
            },
            templates: {
                files: [
                    '<%= dirs.app_js_site %>/{,*/}*template.html'
                ],
                tasks: ['htmlhint', 'build:js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= dirs.app_js_site %>/{,*/}*.js',
                    '<%= dirs.app_js_vendor %>/{,*/}*.js',
                    '<%= dirs.app_css_site %>/{,*/}*.css',
                    '<%= dirs.app_css_vendor %>/{,*/}*.css',
                    '<%= dirs.app_js_site %>/{,*/}*.html',
                    '<%= dirs.app %>/images/{,*/}*.*',
                    '<%= dirs.app %>/fonts/{,*/}*.*',
                    '<%= dirs.app %>/{,*/}*.html'
                ]
            }
        }
    });

    // Helper Tasks
    grunt.registerTask('lint', ['jslint', 'jscs']);
    grunt.registerTask('build:htmls', ['htmlhint', 'copy:htmls']);
    grunt.registerTask('build:static', ['copy:images', 'copy:fonts']);
    grunt.registerTask('build:js', ['lint', 'ngtemplates', 'concat:js', 'ngAnnotate']);
    grunt.registerTask('build:css', ['concat:css']);
    grunt.registerTask('build:optimize', ['cssmin', 'uglify']);

    // User Tasks
    grunt.registerTask('build', ['clean:build', 'build:js', 'build:css', 'build:htmls', 'build:static']);
    grunt.registerTask('build:prod', ['build', 'build:optimize', 'clean:tmp']);
    grunt.registerTask('serve', ['build:prod', 'connect:prod']);
    grunt.registerTask('serve:dev', ['build', 'connect:livereload', 'watch']);

};
