var patchArray = require('./../util/patch-array')
var request = require('request');
var jwtutil = require('../../../../lib/util/jwtutil');
module.exports = function DeviceListIconsDirective(
    $filter
    , gettext
    , DeviceColumnService
    , GroupService
    , StandaloneService
    , VmodalOpenService
    , UserService
    , phoneCancelnService
    , timeOrderService
) {
    function DeviceItem() {
        return {
            build: function () {
                var li = document.createElement('li')
                li.className = 'cursor-select pointer thumbnail'

                // the whole li is a link
                var a = document.createElement('a');
                a.className = "clearfix clickA";
                li.appendChild(a)

                // .device-photo-small
                var photo = document.createElement('div');
                var title = document.createElement('h4');
                photo.className = 'device-photo-small'
                title.className = 'device-title'
                var img = document.createElement('img');
                var imgRight = document.createElement('div')
                var imgRightP1 = document.createElement('p');
                var imgRightP2 = document.createElement('p');
                var imgRightP3 = document.createElement('p');
                var imgRightP4 = document.createElement('p');
                var imgRightP5 = document.createElement('p');
                var backDiv = document.createElement('div');
                var backDivP1 = document.createElement('p');
                var backDivP2 = document.createElement('p');
                var backDivP3 = document.createElement('p');
                var backDivP4 = document.createElement('p');
                var backDivBtnCanel = document.createElement('button');
                backDivBtnCanel.className = 'btn btn-danger btn-xs backDivBtnCanel';
                var orderBtn = document.createElement('button');
                orderBtn.appendChild(document.createTextNode('预约'));
                orderBtn.className = "order-btn";
                backDiv.className = "back-div-none";
                backDivBtnCanel.appendChild(document.createTextNode('取消预约'));
                backDivP1.appendChild(document.createTextNode('已预约'));

                backDivP4.appendChild(document.createTextNode('（注意：预约成功将收到短信提醒，未收到提醒则为预约失败。）'));
                orderBtn.className = 'order-btn btn btn-link'
                photo.appendChild(img);
                imgRight.className = 'pDiv'
                imgRight.appendChild(imgRightP1);
                imgRight.appendChild(imgRightP2);
                imgRight.appendChild(imgRightP3);
                imgRight.appendChild(imgRightP4);
                imgRight.appendChild(imgRightP5);
                photo.appendChild(imgRight);
                backDiv.appendChild(backDivP1);
                backDiv.appendChild(backDivP2);
                backDiv.appendChild(backDivP3);
                backDiv.appendChild(backDivP4);
                backDiv.appendChild(backDivBtnCanel);
                a.appendChild(title);
                a.appendChild(photo);

                // .device-name
                var name = document.createElement('div')
                name.className = 'device-name'
                name.appendChild(document.createTextNode(''))
                a.appendChild(name)

                // button
                var button = document.createElement('button');
                button.appendChild(document.createTextNode(''));
                a.appendChild(button);
                a.appendChild(backDiv);
                a.appendChild(orderBtn);
                return li
            }
            , update: function (li, device) {
                // console.log(device.serial);
                var li = li
                var a = li.firstChild;
                var titleType = a.firstChild;
                var img = a.firstChild.nextSibling.firstChild;
                var phoneType1 = a.firstChild.nextSibling.firstChild.nextSibling.childNodes[0]
                var phoneType2 = a.firstChild.nextSibling.firstChild.nextSibling.childNodes[1]
                var phoneType3 = a.firstChild.nextSibling.firstChild.nextSibling.childNodes[2]
                var phoneType4 = a.firstChild.nextSibling.firstChild.nextSibling.childNodes[3]
                var phoneType5 = a.firstChild.nextSibling.firstChild.nextSibling.childNodes[4]

                var name = a.firstChild.nextSibling
                var button = a.firstChild.nextSibling.nextSibling.nextSibling
                var orderBtn = a.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;

                var backDiv = a.firstChild.nextSibling.nextSibling.nextSibling.nextSibling;
                var backDivP2 = a.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.nextSibling
                var backDivP3 = a.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.nextSibling.nextSibling
                var backDivBtnCanel = a.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.nextSibling.nextSibling.nextSibling
                var at = button.firstChild
                var classes = 'btn btn-xs device-status '

                // .device-photo-small
                if (img.getAttribute('src') !== device.enhancedImage120) {
                    // img.setAttribute('src', device.enhancedImage120);

                }
                request.post({ url: `${jwtutil.baseUrl}/stf/findPhoneBySerial`, form: { serial: device.serial } }, function (error, response, body) {
                    at.nodeValue = $filter('translate')(device.enhancedStateAction)
                    if (!error) {
                        var respBody = JSON.parse(body)
                        device.brandPhone = respBody.phoneSelect.brand;
                        device.phoneType = respBody.phoneSelect.phoneType;
                        if (respBody.appoint == 2 && UserService.publicEmail == respBody.stfAppoint.account) {
                            orderBtn.innerHTML = "已预约"
                            orderBtn.className = 'order-btn btn btn-link btn-link-use'

                            backDiv.className = 'back-div';
                            backDivP2.innerHTML = `开始时间：${respBody.stfAppoint.starttime}`;
                            backDivP3.innerHTML = `结束时间：${respBody.stfAppoint.endtime}`;
                        } else if (respBody.appoint == 1) {
                            console.log(UserService.publicEmail, respBody.stfAppoint.account)
                            if (UserService.publicEmail == respBody.stfAppoint.account) {
                                // backDiv.className = 'back-div';
                                orderBtn.innerHTML = "使用中";
                                orderBtn.className = 'order-btn btn btn-link btn-link-use'
                                // backDivP2.innerHTML = `开始时间：${respBody.stfAppoint.starttime}`;
                                // backDivP3.innerHTML = `结束时间：${respBody.stfAppoint.endtime}`;
                                // backDivBtnCanel.className = 'back-div-none';
                            } else {
                                orderBtn.innerHTML = "占用中";
                                li.classList.add('device-is-busy')
                                a.removeAttribute('href')
                                backDiv.className = 'back-div-none';
                                button.className = 'btn btn-xs device-status state-busy btn-warning'
                                at.nodeValue = "设备繁忙"
                            }
                        } else {
                            backDiv.className = 'back-div-none';
                        }
                        img.setAttribute('src', `${jwtutil.baseUrl}${respBody.phoneSelect.assetNumbers}`)
                        // img.setAttribute('src', `http://localhost:7100/${device.enhancedImage24}`)
                        if (respBody.phoneSelect.brand == "未发现") {
                            respBody.phoneSelect.brand = device.serial;
                        }
                        phoneType1.innerHTML = `品牌：${respBody.phoneSelect.brandPrefix}`;
                        phoneType2.innerHTML = `系统： ${respBody.phoneSelect.phoneVersion}`
                        phoneType3.innerHTML = `屏幕大小： ${respBody.phoneSelect.phoneSize}`
                        phoneType4.innerHTML = `分辨率： ${respBody.phoneSelect.resolution}`
                        phoneType5.innerHTML = `设备型号： ${respBody.phoneSelect.equipmentType}`
                        titleType.innerHTML = `${respBody.phoneSelect.phoneType}`
                        // button
                    } else {
                        console.log("error");
                        console.log(error);
                        res.render('error', { error: err });
                    }
                })

                function getStateClasses(state) {
                    var stateClasses = {
                        using: 'state-using btn-primary',
                        busy: 'state-busy btn-warning',
                        available: 'btn-primary',
                        ready: 'state-ready btn-primary-outline',
                        present: 'state-present btn-primary-outline',
                        preparing: 'state-preparing btn-primary-outline btn-success-outline',
                        unauthorized: 'state-unauthorized btn-danger-outline',
                        offline: 'state-offline btn-warning-outline',
                        automation: 'state-automation btn-info'
                    }[state]
                    if (typeof stateClasses === 'undefined') {
                        stateClasses = 'btn-default-outline'
                    }
                    return stateClasses
                }

                button.className = classes + getStateClasses(device.state)
                // UserService.getTime().then(resp=>{
                // if(resp.data.cumulativeTime <= 60) {
                //   a.removeAttribute('href')
                //   name.classList.add('state-available')
                //   li.classList.add('device-is-busy')
                //   console.log(classes + getStateClasses(device.state));
                //   button.className = "btn btn-xs device-status btn-default-outline"
                //   if (device.state === 'available') {
                //     name.classList.add('state-available')
                //   } else {
                //     name.classList.remove('state-available')
                //   }
                // }else {
                if (device.state === 'available') {
                    name.classList.add('state-available')
                } else {
                    name.classList.remove('state-available')
                }

                if (device.usable) {
                    a.href = '#!/control/' + device.serial
                    li.classList.remove('device-is-busy')
                }
                else {
                    a.removeAttribute('href')
                    li.classList.add('device-is-busy')
                }
                // }
                // })
                return li
                // }
            }
        }
    }

    return {
        restrict: 'E'
        , template: require('./device-list-icons.pug')
        , scope: {
            tracker: '&tracker'
            , columns: '&columns'
            , sort: '=sort'
            , filter: '&filter'
        }
        , link: function (scope, element) {
            var tracker = scope.tracker()
            var activeColumns = []
            var activeSorting = []
            var activeFilters = []
            var list = element.find('ul')[0]
            var items = list.childNodes
            var prefix = 'd' + Math.floor(Math.random() * 1000000) + '-'
            var mapping = Object.create(null)
            let filterMap = Object.create(null)
            var builder = DeviceItem();
            scope.limit = 1
            scope.page = 1
            scope.pageList = [1]


            function kickDevice(device, force) {
                return GroupService.kick(device, force).catch(function (e) {
                    alert($filter('translate')(gettext('Device cannot get kicked from the group')))
                    throw new Error(e)
                })
            }

            function inviteDevice(device) {
                return GroupService.invite(device).then(function () {
                    scope.$digest()
                })
            }

            element.on('click', function (e) {
                // UserService.getTime().then(resp=>{
                //   if(resp.data.cumulativeTime <= 60) {
                //      VmodalOpenService.open();
                //      e.preventDefault();
                //      return false
                //   } else {
                var id
                if (e.target.classList.contains('order-btn')) {
                    var sendDevices = mapping[e.target.parentNode.parentNode.id]
                    request.post({ url: `${jwtutil.baseUrl}/stf/findPhoneBySerial`, form: { serial: sendDevices.serial } }, function (error, response, body) {
                        var respBody = JSON.parse(body)
                        sendDevices.brandPhone = respBody.phoneSelect.brand;
                        sendDevices.phoneType = respBody.phoneSelect.phoneType;
                        console.log(8888);
                        console.log(sendDevices);
                        timeOrderService.open(sendDevices);
                    })
                    e.preventDefault();
                }
                if (e.target.classList.contains('back-div')) {
                    e.preventDefault();
                }
                if (e.target.classList.contains('backDivBtnCanel')) {
                    var sendDevices = mapping[e.target.parentNode.parentNode.parentNode.id]
                    request.post({ url: `${jwtutil.baseUrl}/stf/findPhoneBySerial`, form: { serial: sendDevices.serial } }, function (error, response, body) {
                        var respBody = JSON.parse(body)
                        sendDevices.stfAppoint = respBody.stfAppoint
                        sendDevices.brandPhone = respBody.phoneSelect.brand;
                        sendDevices.phoneType = respBody.phoneSelect.phoneType;
                        sendDevices.sysVer = respBody.phoneSelect.phoneVersion;
                        phoneCancelnService.open(sendDevices)
                    })
                    e.preventDefault()
                }
                // if(e.target.classList.contains('backDivBtnenter')) {
                //   console.log('使用')
                //   e.preventDefault()
                // }
                if (e.target.classList.contains('thumbnail')) {
                    id = e.target.id
                } else if (e.target.classList.contains('device-status') ||
                    e.target.classList.contains('device-photo-small') ||
                    e.target.classList.contains('device-status')) {
                    id = e.target.parentNode.parentNode.id
                } else if (e.target.parentNode.classList.contains('device-photo-small')) {
                    id = e.target.parentNode.parentNode.parentNode.id
                }

                if (id) {
                    var device = mapping[id];
                    if (e.altKey && device.state === 'available') {
                        inviteDevice(device)
                        e.preventDefault()
                    }

                    if (e.shiftKey && device.state === 'available') {
                        StandaloneService.open(device)
                        e.preventDefault()
                    }

                    if (device.using) {
                        kickDevice(device)
                        e.preventDefault()
                    }
                }
                // }
                // })
            })

            // Import column definitions
            scope.columnDefinitions = DeviceColumnService

            // Sorting
            scope.sortBy = function (column, multiple) {
                function findInSorting(sorting) {
                    for (var i = 0, l = sorting.length; i < l; ++i) {
                        if (sorting[i].name === column.name) {
                            return sorting[i]
                        }
                    }
                    return null
                }

                var swap = {
                    asc: 'desc'
                    , desc: 'asc'
                }

                var fixedMatch = findInSorting(scope.sort.fixed)
                if (fixedMatch) {
                    fixedMatch.order = swap[fixedMatch.order]
                    return
                }

                var userMatch = findInSorting(scope.sort.user)
                if (userMatch) {
                    userMatch.order = swap[userMatch.order]
                    if (!multiple) {
                        scope.sort.user = [userMatch]
                    }
                }
                else {
                    if (!multiple) {
                        scope.sort.user = []
                    }
                    scope.sort.user.push({
                        name: column.name
                        , order: scope.columnDefinitions[column.name].defaultOrder || 'asc'
                    })
                }
            }

            // Watch for sorting changes
            scope.$watch(
                function () {
                    return scope.sort
                }
                , function (newValue) {
                    activeSorting = newValue.fixed.concat(newValue.user)
                    scope.sortedColumns = Object.create(null)
                    activeSorting.forEach(function (sort) {
                        scope.sortedColumns[sort.name] = sort
                    })
                    sortAll()
                }
                , true
            )

            // Watch for column updates
            scope.$watch(
                function () {
                    return scope.columns()
                }
                , function (newValue) {
                    updateColumns(newValue)
                }
                , true
            )

            // Update now so that we don't have to wait for the scope watcher to
            // trigger.
            updateColumns(scope.columns())

            // Updates visible columns. This method doesn't necessarily have to be
            // the fastest because it shouldn't get called all the time.
            function updateColumns(columnSettings) {
                var newActiveColumns = []

                // Check what we're supposed to show now
                columnSettings.forEach(function (column) {
                    if (column.selected) {
                        newActiveColumns.push(column.name)
                    }
                })

                // Figure out the patch
                var patch = patchArray(activeColumns, newActiveColumns)

                // Set up new active columns
                activeColumns = newActiveColumns

                return patchAll(patch)
            }

            // Updates filters on visible items.
            function updateFilters(filters) {
                activeFilters = filters
                return filterAll()
            }

            // Applies filteItem() to all items.
            function filterAll() {
                for (var i = 0, l = items.length; i < l; ++i) {
                    filterItem(items[i], mapping[items[i].id])
                }
            }

            // Filters an item, perhaps removing it from view.
            function filterItem(item, device) {
                if (match(device)) {
                    item.classList.remove('filter-out')
                }
                else {
                    item.classList.add('filter-out')
                }
            }

            // Checks whether the device matches the currently active filters.
            function match(device) {
                for (var i = 0, l = activeFilters.length; i < l; ++i) {
                    var filter = activeFilters[i]
                    var column
                    if (filter.field) {
                        column = scope.columnDefinitions[filter.field]
                        if (column && !column.filter(device, filter)) {
                            return false
                        }
                    }
                    else {
                        var found = false
                        for (var j = 0, k = activeColumns.length; j < k; ++j) {
                            column = scope.columnDefinitions[activeColumns[j]]
                            if (column && column.filter(device, filter)) {
                                found = true
                                break
                            }
                        }
                        if (!found) {
                            return false
                        }
                    }
                }
                return true
            }

            // Update now so we're up to date.
            updateFilters(scope.filter())

            // Watch for filter updates.
            scope.$watch(
                function () {
                    return scope.filter()
                }
                , function (newValue) {
                    updateFilters(newValue)
                }
                , true
            )

            // Calculates a DOM ID for the device. Should be consistent for the
            // same device within the same table, but unique among other tables.
            function calculateId(device) {
                return prefix + device.serial
            }

            // Compares two devices using the currently active sorting. Returns <0
            // if deviceA is smaller, >0 if deviceA is bigger, or 0 if equal.
            var compare = (function () {
                var mapping = {
                    asc: 1
                    , desc: -1
                }
                return function (deviceA, deviceB) {
                    var diff

                    // Find the first difference
                    for (var i = 0, l = activeSorting.length; i < l; ++i) {
                        var sort = activeSorting[i]
                        diff = scope.columnDefinitions[sort.name].compare(deviceA, deviceB)
                        if (diff !== 0) {
                            diff *= mapping[sort.order]
                            break
                        }
                    }

                    return diff
                }
            })()

            // Creates a completely new item for the device. Means that this is
            // the first time we see the device.
            function createItem(device) {
                var id = calculateId(device)
                var item = builder.build()

                item.id = id
                builder.update(item, device)
                mapping[id] = device

                return item
            }

            // Patches all items.
            function patchAll(patch) {
                for (var i = 0, l = items.length; i < l; ++i) {
                    patchItem(items[i], mapping[items[i].id], patch)
                }
            }

            // Patches the given item by running the given patch operations in
            // order. The operations must take into account index changes caused
            // by previous operations.
            function patchItem(/*item, device, patch*/) {
                // Currently no-op
            }

            // Updates all the columns in the item. Note that the item must be in
            // the right format already (built with createItem() and patched with
            // patchItem() if necessary).
            function updateItem(item, device) {
                var id = calculateId(device)

                item.id = id
                builder.update(item, device)

                return item
            }

            // Inserts an item into the table into its correct position according to
            // current sorting.
            function insertItem(item, deviceA) {
                return insertItemToSegment(item, deviceA, 0, items.length - 1)
            }

            // Inserts an item into a segment of the table into its correct position
            // according to current sorting. The value of `hi` is the index
            // of the last item in the segment, or -1 if none. The value of `lo`
            // is the index of the first item in the segment, or 0 if none.
            function insertItemToSegment(item, deviceA, low, high) {
                var total = items.length
                var lo = low
                var hi = high

                if (lo > hi) {
                    // This means that `lo` refers to the first item of the next
                    // segment (which may or may not exist), and we should put the
                    // row before it.
                    list.insertBefore(item, lo < total ? items[lo] : null)
                }
                else {
                    var after = true
                    var pivot = 0
                    var deviceB

                    while (lo <= hi) {
                        pivot = ~~((lo + hi) / 2)
                        deviceB = mapping[items[pivot].id]

                        var diff = compare(deviceA, deviceB)

                        if (diff === 0) {
                            after = true
                            break
                        }

                        if (diff < 0) {
                            hi = pivot - 1
                            after = false
                        }
                        else {
                            lo = pivot + 1
                            after = true
                        }
                    }

                    if (after) {
                        list.insertBefore(item, items[pivot].nextSibling)
                    }
                    else {
                        list.insertBefore(item, items[pivot])
                    }
                }
            }

            // Compares an item to its siblings to see if it's still in the correct
            // position. Returns <0 if the device should actually go somewhere
            // before the previous item, >0 if it should go somewhere after the next
            // item, or 0 if the position is already correct.
            function compareItem(item, device) {
                var prev = item.previousSibling
                var next = item.nextSibling
                var diff

                if (prev) {
                    diff = compare(device, mapping[prev.id])
                    if (diff < 0) {
                        return diff
                    }
                }

                if (next) {
                    diff = compare(device, mapping[next.id])
                    if (diff > 0) {
                        return diff
                    }
                }

                return 0
            }

            // Sort all items.
            function sortAll() {
                // This could be improved by getting rid of the array copying. The
                // copy is made because items can't be sorted directly.
                var sorted = [].slice.call(items).sort(function (itemA, itemB) {
                    return compare(mapping[itemA.id], mapping[itemB.id])
                })

                // Now, if we just append all the elements, they will be in the
                // correct order in the table.
                for (var i = 0, l = sorted.length; i < l; ++i) {
                    list.appendChild(sorted[i])
                }
            }

            // Triggers when the tracker sees a device for the first time.
            function addListener(device) {
                var item = createItem(device)
                filterItem(item, device)
                insertItem(item, device)
                updateList()
                updatePageList()
            }
            function updateList() {

            }
            function updatePageList() {
                let length = Object.keys(mapping)
                let allPage = Math.ceil(length / scope.limit)
                scope.pageList = []
                for (let i = 1; i <= allPage; i++) {
                    scope.pageList.push(i)
                }

            }

            // Triggers when the tracker notices that a device changed.
            function changeListener(device) {
                var id = calculateId(device)
                var item = list.children[id]

                if (item) {
                    // First, update columns
                    updateItem(item, device)

                    // Maybe the item is not sorted correctly anymore?
                    var diff = compareItem(item, device)
                    if (diff !== 0) {
                        // Because the item is no longer sorted correctly, we must
                        // remove it so that it doesn't confuse the binary search.
                        // Then we will simply add it back.
                        list.removeChild(item)
                        insertItem(item, device)
                    }
                }
            }

            // Triggers when a device is removed entirely from the tracker.
            function removeListener(device) {
                var id = calculateId(device)
                var item = list.children[id]

                if (item) {
                    list.removeChild(item)
                }

                delete mapping[id]
            }

            tracker.on('add', addListener)
            tracker.on('change', changeListener)
            tracker.on('remove', removeListener)

            // Maybe we're already late
            tracker.devices.forEach(addListener)

            scope.$on('$destroy', function () {
                tracker.removeListener('add', addListener)
                tracker.removeListener('change', changeListener)
                tracker.removeListener('remove', removeListener)
            })
        }
    }
}
