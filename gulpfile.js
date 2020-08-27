// モジュールの読み込み
var gulp = require("gulp");
var sass = require("gulp-sass");
var eslint = require("gulp-eslint");

var targetDir = "src/assets/";
var applyLintPaths = {
  allSrcJs: "src/**/*.js",
  gulpFile: "gulpfile.js"
};

/**
 * lint
 */
gulp.task("lint", function() {
  return (
    gulp.src([
      applyLintPaths.allSrcJs,
      applyLintPaths.gulpFile
    ])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
  );
});

gulp.task("lint-watch", function() {
  return (
    gulp.watch(applyLintPaths.allSrcJs, gulp.task("lint"))
  );
});

/**
 * sass
 */
gulp.task("sass", function () {
  return (
    gulp.src(targetDir + "sass/**/*.scss")  // 取得するファイル
      .pipe(sass({ outputStyle: "expanded" }))  // コンパイル時のオプション
      .pipe(gulp.dest(targetDir + "css"))  // 保存先
  );
});

gulp.task("sass-watch", function () {
  return gulp.watch(targetDir + "sass/**/*.scss", function () {
    return (
      gulp.src(targetDir + "sass/**/*.scss")
        .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
        .pipe(gulp.dest(targetDir + "css"))
    );
  });
});