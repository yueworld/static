module.exports = function ($app) {

    // ========================================== ScreenHelper ==========================================================

    // 全屏
    function fullscreen() {
        var docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.msRequestFullscreen) {
            docElm = document.body;
            docElm.msRequestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
        $app.injector.invoke(["$timeout", function ($timeout) {
            $timeout(function () {
                $app.screen.isFullscreen = true;
            }, 300)
        }])
    }

    // 退出全屏
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        $app.injector.invoke(["$timeout", function ($timeout) {
            $timeout(function () {
                $app.screen.isFullscreen = false;
            }, 300)
        }])
    }

    $app.screen = {
        isFullscreen: false,
        height: $app.window.height(),
        width: $app.window.width(),
        // 全屏
        fullscreen: fullscreen,
        // 退出
        exitFullscreen: exitFullscreen
    };
    $app.window.resize(function () {
        $app.screen = angular.extend($app.screen, {
            height: $app.window.height(), width: $app.window.width()
        })
    });

}