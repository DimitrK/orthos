module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: [
                "source/*.js"
            ],
            options: {
                jshintrc: '.jshintrc'
            },
        },
        jasmine: {
            all: {
                src: 'source/orthos.js',
                options: {
                    template: require('grunt-template-jasmine-istanbul'),
                    //template: 'spec/lib/custom.tmpl',
                    templateOptions: {
                        coverage: 'report/istanbul/coverage.json',
                        template: 'spec/lib/custom.tmpl',
                        report: [
                            {type: 'html', options: {dir: 'report/istanbul'}},
                            {type: 'text-summary'}
                        ],
                        thresholds: {
                            lines: 80,
                            statements: 80,
                            branches: 80,
                            functions: 80
                        }
                    },
                    specs: 'spec/*spec.js',
                    keepRunner: true,
                    helpers: 'spec/*helper.js',
                    vendor: 'http://enyojs.com/enyo-2.4.0/enyo.js',
                    styles: 'http://enyojs.com/enyo-2.4.0/enyo.css'
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('travis', [
        'jshint', 'jasmine'
    ]);

};
