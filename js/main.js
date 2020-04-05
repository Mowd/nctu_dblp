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

se.Search = {
    setCallback: function() {
        $(".btn-search").on("click", function() {
            var keyword = $(".search-keyword").val();
            se.Search.search(keyword);
        });
        $(".search-keyword").on("keypress", function(e) {
            if(e.keyCode == 13) {
                $(".btn-search").click();
            }
        });
    },
    search: function(keyword) {
        $(".loading").show();
        var professor_list = se.Filter.Professor.getSelected();
        var conference_list = se.Filter.Conference.getSelected();
        if(professor_list.length > 0) {
            for(var i in professor_list) {
                keyword += " author:" + professor_list[i].replace(/-/g, ' ') + ": ";
            }
        }
        if(conference_list.length > 0) {
            keyword += " venue:" + conference_list[0] + ": ";
        }
        $.getJSON("https://dblp.org/search/publ/api?format=jsonp&q=" + keyword + "&callback=?", function(res) {
            var output = [];
            res = res.result.hits.hit;
            for(var i in res) {
                var author_li = [];
                for(var j in res[i]["info"]["authors"]["author"]) {
                    author_li.push(res[i]["info"]["authors"]["author"][j]["text"]);
                }
                output.push(
                    res[i]["info"]["year"] + "<br />",
                    '<span style="color: #999;">' + author_li.join(", ") + "</span><br />",
                    '<b>' + res[i]["info"]["title"] + "</b> " + res[i]["info"]["venue"] + " " + res[i]["info"]["pages"],
                    '<a href="' + res[i]["info"]["url"] + '" target="_blank">[VIEW]</a>',
                    "<hr>"
                );
            }
            $(".search-result").html(output.join("\n"));
            $(".loading").hide();
        });
    },
};

se.Filter = {
    setCallback: function() {
        se.Filter.Conference.render();
        se.Filter.Professor.render();
        se.Filter.searchCallback();
        $("body").delegate(".panel-chkbox", "click", function () {
            if($(this).prop("checked")) {
                $(this).closest(".panel").find(".panel-body [type=checkbox]").prop("checked", true);
            }
            else {
                $(this).closest(".panel").find(".panel-body [type=checkbox]").prop("checked", false);
            }
        });
        $(".level-chkbox").on("click", function() {
            var level = $(this).attr("value");
            if($(this).prop("checked")) {
                $(".chkbox-conference[level=" + level + "]").prop("checked", true);
            }
            else {
                $(".chkbox-conference[level=" + level + "]").prop("checked", false);
            }
        });
    },
    searchCallback: function() {
        $(".filter-search").on("keyup", function(e) {
            var target = $(this).attr("target");
            var keyword = $(this).val().toLowerCase();
            if($(this).val() == "") {
                $(target).find("label").show();
                $(target).find(".panel").show();
            }
            else {
                $(target).find("label").each(function() {
                    if($(this).attr("text").indexOf(keyword) == -1) {
                        $(this).hide();
                    }
                    else {
                        $(this).show();
                    }
                });
                $(target).find(".panel").each(function() {
                    var num = $(this).find("label:visible").length;
                    if(num == 0) {
                        $(this).hide();
                    }
                });
            }
        });
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
                        var level = data[i][j]["level"];
                        if(short == "") {
                            short = full.substr(0, 7) + "...";
                        }
                        li.push(
                            '<div><label text="' + short.toLowerCase() + '"><input type="checkbox" class="chkbox-conference" value="' + short + '" level="' + level + '" /> <span title="' + full +' ">' + short + '</span></label></div>'
                        );
                    }
                    var panel = [
                        '<div class="panel panel-default">',
                        '    <div class="panel-heading">',
                        '        <h3 class="panel-title"><input type="checkbox" class="panel-chkbox"> ' + i + '</h3>',
                        '    </div>',
                        '    <div class="panel-body">' + li.join("\n") + '</div>',
                        '</div>'
                    ];
                    html.push(panel.join("\n"));
                }
                $(".conference-block").html(html.join("\n"));
            });
        },
        getSelected: function() {
            var li = [];
            $(".chkbox-conference").each(function() {
                if($(this).prop("checked")) {
                    li.push($(this).val());
                }
            });
            return li;
        }
    },
    Professor: {
        render: function() {
            $.getJSON("professor.json", function(data) {
                var html = [];
                var li = [];
                for(var i in data) {
                    li.push(
                        '<div><label text="' + data[i].toLowerCase() + '"><input type="checkbox" class="chkbox-professor" value="' + data[i] + '" /> ' + data[i] + '</label></div>'
                    );
                }
                var panel = [
                    '<div class="panel panel-default">',
                    '    <div class="panel-heading">',
                    '        <h3 class="panel-title"><input type="checkbox" class="panel-chkbox"> NCTU</h3>',
                    '    </div>',
                    '    <div class="panel-body">' + li.join("\n") + '</div>',
                    '</div>'
                ];
                $(".professor-block").html(panel.join("\n"));
            });
        },
        getSelected: function() {
            var li = [];
            $(".chkbox-professor").each(function() {
                if($(this).prop("checked")) {
                    li.push($(this).val());
                }
            });
            return li;
        }
    }
}
