var gulp = require('gulp'), // Подключаем Gulp
    jade = require('gulp-jade'), //Подключаем Jade пакет,
    sass = require('gulp-sass'), //Подключаем Sass пакет,
    browserSync = require('browser-sync'), // Подключаем Browser Sync
    concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    cleancss      = require('gulp-clean-css'),
    rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache = require('gulp-cache'), // Подключаем библиотеку кеширования
    imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    imageResize = require('gulp-image-resize'),
    autoprefixer = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
    notify        = require("gulp-notify"),
    rsync = require('gulp-rsync');

gulp.task('jade', function() {
    return gulp.src('app/*.jade')
        .pipe(jade({ pretty: true}).on("error", notify.onError()))
        .pipe(gulp.dest('app'));
});

gulp.task('sass', function() { // Создаем таск Sass
    return gulp.src('app/sass/**/*.sass') // Берем источник
        .pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError())) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
        .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
        .pipe(browserSync.reload({ stream: true })) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { baseDir: 'app/' }, //Локальная директория
        //proxy: 'http://localhost',  // Заменить этой строкой если работаем на сервере
        notify: false // Отключение уведомлений
    });
});

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
            'app/libs/html5shiv/dist/html5shiv.min.js', // HTML5 для старый браузеров
            'app/libs/bootstrap/js/bootstrap.min.js' // Bootstrap
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('css-libs', ['sass'], function() {
    return gulp.src('app/css/libs.css') // Выбираем файл для минификации
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({ suffix: '.min' })) // Добавляем суффикс .min
        .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('watch', ['jade', 'sass', 'css-libs', 'scripts', 'browser-sync'], function() {
    gulp.watch('app/*.jade', ['jade']);
    gulp.watch('app/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch('app/**/*.html', browserSync.reload); // Наблюдение за HTML файлами
    gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(imageResize({ width: 1920, crop: false, upscale: false })) //GraphicsMagick и ImageMagick installed
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imageminJpegRecompress({
                    loops: 5,
                    min: 65,
                    max: 70,
                    quality: 'medium'
                }),
                imagemin.svgo(),
                imagemin.optipng({ optimizationLevel: 3 }),
                pngquant({ quality: '65-70', speed: 5 })
            ], {
                verbose: true
            }))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'jade', 'sass', 'css-libs', 'scripts'], function() {

    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
            'app/css/main.css',
            'app/css/libs.min.css'
        ])
        .pipe(gulp.dest('dist/css'))

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('dist/fonts'))

    var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('dist/js'))

    var buildHtml = gulp.src('app/**/*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('dist'));

});

gulp.task('clear', function(callback) {
    return cache.clearAll();
})

gulp.task('rsync', ['build'], function() {
    return gulp.src('dist/**')
        .pipe(rsync({
            root: 'dist/',
            hostname: 'user@hostname',
            destination: '/www',
            // include: ['*.htaccess'], // Includes files to deploy
            exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
            recursive: true,
            archive: true,
            silent: false,
            compress: true
        }))
});

gulp.task('default', ['watch']);