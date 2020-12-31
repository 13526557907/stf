var Promise = require('bluebird')

module.exports = function GroupServiceFactory(
  socket
, TransactionService
, TransactionError
) {
  var groupService = {
  }

  groupService.invite = function(device) {
    console.log('inviteDeviceEnter---', device)
    if (!device.usable) {
      return Promise.reject(new Error('Device is not usable'))
    }

    var tx = TransactionService.create(device);
    console.log("tx++",tx)
    socket.emit('group.invite', device.channel, tx.channel, {
      requirements: {
        serial: {
          value: device.serial
        , match: 'exact'
        }
      }
    })

    //stf provider --name jinglingyun --min-port 7400 --max-port 7700 --connect-sub tcp://127.0.0.1:7114 --connect-push tcp://127.0.0.1:7116 --group-timeout 900 --public-ip master节点ip --storage-url http://localhost:7100/ --adb-host slave结点ip --adb-port 5037 --vnc-initial-size 600x800 --mute-master never --allow-remote
    return tx.promise
      .then(function(result) {
        return result.device
      })
      .catch(TransactionError, function() {
        throw new Error('Device refused to join the group')
      })
  }

  groupService.kick = function(device, force) {
    if (!force && !device.usable) {
      return Promise.reject(new Error('Device is not usable'))
    }

    var tx = TransactionService.create(device)
    console.log(tx);
    socket.emit('group.kick', device.channel, tx.channel, {
      requirements: {
        serial: {
          value: device.serial
        , match: 'exact'
        }
      }
    })
    return tx.promise
      .then(function(result) {
        return result.device
      })
      .catch(TransactionError, function() {
        throw new Error('Device refused to join the group')
      })
  }

  return groupService
}
