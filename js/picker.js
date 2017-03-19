InitializePicker = function(startYear, endYear, id) {
    var dateArray = [];
    var dateStringArray = [];
    var i = startYear;
    for (i = startYear; i <= endYear; i++) {
        dateArray.push(i);
        dateStringArray.push(i.toString());
    }

    $(id).slider({
        ticks: dateArray,
        ticks_labels: dateStringArray,
        ticks_snap_bounds: 30
    });
}
