function p(s) {
    return s < 10 ? "0" + s : s;
};

function getDateTime(dt) {
    var weekdays = ['週日','週一','週二','週三','週四','週五','週六'];
    var year = dt.getFullYear();
    var month = p(dt.getMonth() + 1);
    var day = p(dt.getDate());
    var hour = p(dt.getHours());
    var min = p(dt.getMinutes());
    var sec = p(dt.getSeconds());
    var weekday = weekdays[dt.getDay()];
    return weekday + " " + month + "/" + day + " " + hour + ":" + min + ":" + sec;
};

function getWeekDate(dt) {
    var weekdays = ['週日','週一','週二','週三','週四','週五','週六'];
    var year = dt.getFullYear();
    var month = p(dt.getMonth() + 1);
    var day = p(dt.getDate());
    var hour = p(dt.getHours());
    var min = p(dt.getMinutes());
    var sec = p(dt.getSeconds());
    var weekday = weekdays[dt.getDay()];
    return year + "-" + month + "-" + day + " (" + weekday + ")";
};

var se = {};

se.Filter = {
    setCallback: function() {
        se.Filter.Conference.render();
        se.Filter.Professor.render();
    },
    Conference: {
        render: function() {
            $.getJSON("conference.json", function(data) {
                var html = [];
                for(var i in data) {
                    var li = [];
                    for(var j in data[i]) {
                        var short = data[i][j]["short"];
                        var full = data[i][j]["full"];
                        if(short == "") {
                            short = full.substr(0, 7) + "...";
                        }
                        li.push(
                            '<input type="checkbox" /> <span title="' + full +' ">' + short + '</span>'
                        );
                    }
                    var panel = [
                        '<div class="panel panel-default">',
                        '    <div class="panel-heading">',
                        '        <h3 class="panel-title">' + i + '</h3>',
                        '    </div>',
                        '    <div class="panel-body">' + li.join("<br>") + '</div>',
                        '</div>'
                    ];
                    html.push(panel.join("\n"));
                }
                $(".conference-block").html(html.join("\n"));
            });
        }
    },
    Professor: {
        render: function() {
            $.getJSON("professor.json", function(data) {
                var html = [];
                var li = [];
                for(var i in data) {
                    li.push(
                        '<input type="checkbox" /> ' + data[i]
                    );
                }
                var panel = [
                    '<div class="panel panel-default">',
                    '    <div class="panel-heading">',
                    '        <h3 class="panel-title">NCTU</h3>',
                    '    </div>',
                    '    <div class="panel-body">' + li.join("<br>") + '</div>',
                    '</div>'
                ];
                $(".professor-block").html(panel.join("\n"));
            });
        }
    }
}