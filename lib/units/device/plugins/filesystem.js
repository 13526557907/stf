var syrup = require('stf-syrup')
var path = require('path')
var url = require('url')
var logger = require('../../../util/logger')
var wire = require('../../../wire')
var wireutil = require('../../../wire/util')
var temp = require('temp')
var fs = require('fs')
var request = require('request')

module.exports = syrup.serial()
  .dependency(require('../support/adb'))
  .dependency(require('../support/router'))
  .dependency(require('../support/push'))
  .dependency(require('../support/storage'))
  .define(function (options, adb, router, push, storage) {
    var log = logger.createLogger('device:plugins:filesystem')
    var plugin = Object.create(null)

    plugin.retrieve = function (file) {
      log.info('Retrieving file "%s"', file)

      return adb.stat(options.serial, file)
        .then(function (stats) {
          return adb.pull(options.serial, file)
            .then(function (transfer) {
              // We may have add new storage plugins for various file types
              // in the future, and add proper detection for the mimetype.
              // But for now, let's just use application/octet-stream for
              // everything like it's 2001.
              return storage.store('blob', transfer, {
                filename: path.basename(file)
                , contentType: 'application/octet-stream'
                , knownLength: stats.size
              })
            })
        })
    }
    plugin.fileSave = function (file, target) {
      log.info('save file "%s" to "%s"', file, target)
      return adb.push(options.serial, file, target)
        .then(function (transfer) {
          return new Promise(function (resolve, reject) {
            transfer.on('progress', function (stats) {
              log.info('[%s] Pushed %d bytes so far',
                options.serial,
                stats.bytesTransferred)
            })
            transfer.on('end', function () {
              log.info('[%s] Push complete', options.serial)
              resolve()
            })
            transfer.on('error', err => {
              log.warn('[%s] Push err')
              log.warn(err)
              reject()
            })
          })
        })
    }

    router.on(wire.FileSystemGetMessage, function (channel, message) {
      var reply = wireutil.reply(options.serial)
      plugin.retrieve(message.file)
        .then(function (file) {
          push.send([
            channel
            , reply.okay('success', file)
          ])
        })
        .catch(function (err) {
          log.warn('Unable to retrieve "%s"', message.file, err.stack)
          push.send([
            channel
            , reply.fail(err.message)
          ])
        })
    })
    router.on(wire.FileSystemSaveMessage, function (channel, message) {
      var reply = wireutil.reply(options.serial)
      urlstr = url.resolve(options.storageUrl, message.href)
      var filepath = path.join(process.cwd(), '/lib/static/' + path.basename(message.href))
      console.log('urlstr---------', urlstr)
      var stream = fs.createWriteStream(filepath)
      request(urlstr).pipe(stream).on('close', function () {
        plugin.fileSave(filepath, `/storage/sdcard0/stf_temp/${path.basename(message.href)}`)
          .then((mes) => {
            push.send([
              channel
              , reply.okay('success')
            ])
          }).catch(function (err) {
            log.warn('Unable to save "%s"', message.href, err.stack)
            push.send([
              channel
              , reply.fail(err.message)
            ])
          })
      })

    })

    router.on(wire.FileSystemListMessage, function (channel, message) {
      var reply = wireutil.reply(options.serial)
      adb.readdir(options.serial, message.dir)
        .then(function (files) {
          push.send([
            channel
            , reply.okay('success', files)
          ])
        })
        .catch(function (err) {
          log.warn('Unable to list directory "%s"', message.dir, err.stack)
          push.send([
            channel
            , reply.fail(err.message)
          ])
        })
    })

    return plugin
  })
