#!/usr/bin/env node
var fs = require('fs'),
    path = require('path');
argv = require('yargs').argv;


var copyFile = function (srcPath, tarPath, cb) {
    var rs = fs.createReadStream(srcPath)
    rs.on('error', function (err) {
        if (err) {
            console.log('read error', srcPath)
        }
        cb && cb(err)
    })

    var ws = fs.createWriteStream(tarPath)
    ws.on('error', function (err) {
        if (err) {
            console.log('write error', tarPath)
        }
        cb && cb(err)
    })
    ws.on('close', function (ex) {
        cb && cb(ex)
    })

    rs.pipe(ws)
}

var copyFolder = function (srcDir, tarDir, cb) {
    fs.readdir(srcDir, function (err, files) {
        var count = 0
        var checkEnd = function () {
            ++count == files.length && cb && cb()
        }

        if (err) {
            checkEnd()
            return
        }

        files.forEach(function (file) {
            var srcPath = path.join(srcDir, file)
            var tarPath = path.join(tarDir, file)
            fs.stat(srcPath, function (err, stats) {
                if (stats.isDirectory()) {
                    fs.exists(tarPath, function (exists) {
                        if (!exists) {
                            fs.mkdir(tarPath, function (err) {
                                if (err) {
                                    console.log(err)
                                    return
                                }
                                copyFolder(srcPath, tarPath, checkEnd)
                            })
                        } else {
                            copyFolder(srcPath, tarPath, checkEnd)
                        }
                    })
                } else {
                    copyFile(srcPath, tarPath, checkEnd)
                }
            })
        })

        //为空时直接回调
        files.length === 0 && cb && cb()
    })
}

if (argv.init) {
    console.log("=============== 初始化项目 --------------");
    var source = path.resolve(__dirname, "../simple"),
        target = path.join(process.cwd());
    helper.copyFolder(source, target);
    console.log("创建完成！");
} else {
    console.log("请尝试以下命令")
    console.log("   // 初始化项目");
    console.log("   yueworld-cli --init");
}