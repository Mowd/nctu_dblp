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

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getSecond() {
    return new Date().getTime() / 1000;
}

const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);

var se = {};
se.result = [];

se.Search = {
    setCallback: function() {
        $(".btn-search").on("click", function() {
            var keyword = $(".search-keyword").val();
            $(".search-result").html("");
            $(".professor-label").attr("count", 0);
            $(".loading").show();
            se.second = getSecond();
            se.result = [];
            se.search_count = 0;
            se.Search.search();
            // var professor_list = se.Filter.Professor.getSelected();
            // var conference_list = se.Filter.Conference.getSelected();
            // if(professor_list.length > 0) {
            //     for(var i in professor_list) {
            //         keyword += " author:" + professor_list[i].replace(/ /g, '_') + ": ";
            //         professor_list[i] = " author:" + professor_list[i].replace(/ /g, '_') + ": ";
            //     }
            // }
            // else {
            //     professor_list = [''];
            // }
            // if(conference_list.length > 0) {
            //     keyword += " venue:" + conference_list[0] + ": ";
            //     for(var i in conference_list) {
            //         conference_list[i] = " venue:" + conference_list[i] + ": ";
            //     }
            // }
            // else {
            //     conference_list = [''];
            // }
            // terms = cartesian(conference_list, professor_list);
            // se.search_total = terms.length;
            // for(var i in terms) {
            //     se.Search.search(terms[i][0] + terms[i][1]);
            //     se.search_count++;
            // }
            // $(".loading-current").text(1);
            // $(".loading-total").text(se.search_total);
        });
        $(".search-keyword").on("keypress", function(e) {
            if(e.keyCode == 13) {
                $(".btn-search").click();
            }
        });
    },
    search: function() {
        //$.getJSON("https://dblp.org/search/publ/api?c=0&h=1000&format=jsonp&q=" + keyword + "&callback=?", function(res) {
        $.ajax({
            url: "https://mowd.tw/dblp/",
            type: "POST",
            data: {
                keyword: $.trim($(".search-keyword").val()),
                venue: se.Filter.Conference.getSelected(),
                professor: se.Filter.Professor.getSelected(),
                year_start: $("[name=year_start]").val(),
                year_end: $("[name=year_end]").val()
            },
            crossDomain: true,
            dataType: "json"
        }).done(function(res) {
            var stat = res.stat;
            res = res.result.hits.hit;
            se.Search.render(res, stat);
            // se.result = se.result.concat(res);
            // se.search_count--;
            // $(".loading-current").text(se.search_total - se.search_count);
            // if(se.search_count == 0) {
            //     se.Search.render(se.result);
            // }
        });
    },
    render: function(res, stat) {
        res = res.filter(function(x) {
            return x !== undefined;
        });
        res = res.filter((res, index, self) => self.findIndex(t => t["@id"] === res["@id"]) === index);
        var output = [];
        for(var i in res) {
            res = res.sort(function(a, b) {
                return a.info.year < b.info.year ? 1 : -1;
            });
            var author_li = [];
            if(!("authors" in res[i]["info"])) {
                continue;
            }
            if(!Array.isArray(res[i]["info"]["authors"]["author"])) {
                var author = res[i]["info"]["authors"]["author"]["text"];
                author_li.push(author);
                var num = parseInt($(".professor-label[text='" + author.toLowerCase() + "']").attr("count")) + 1;
                $(".professor-label[text='" + author.toLowerCase() + "']").attr("count", num);
            }
            else {
                for(var j in res[i]["info"]["authors"]["author"]) {
                    var author = res[i]["info"]["authors"]["author"][j]["text"];
                    author_li.push(author);
                    var num = parseInt($(".professor-label[text='" + author.toLowerCase() + "']").attr("count")) + 1;
                    $(".professor-label[text='" + author.toLowerCase() + "']").attr("count", num);
                }
            }

            output.push(
                res[i]["info"]["year"] + "<br />",
                '<span style="color: #999;">' + author_li.join(", ") + "</span><br />",
                '<b>' + res[i]["info"]["title"] + "</b> " + res[i]["info"]["venue"] + " " + res[i]["info"]["pages"],
                '<a href="' + res[i]["info"]["url"] + '" target="_blank">[VIEW]</a>',
                "<hr>"
            );
        }
        $(".search-result").append(output.join("\n"));
        $(".professor-label").each(function() {
            $(this).find(".paper-count").text("(" + $(this).attr("count") + ")");
        });
        $(".loading").hide();
        var total_second = Math.round((getSecond() - se.second) * 100) / 100;
        $(".result-count").show().text("About " + numberWithCommas(res.length) + " results. (" + total_second.toString() + " seconds)");

        //statistics
        var venue_stat = [];
        var table_html = [
            '<table class="table table-hover table-bordered">'
        ];

        for(var v in stat.venue) {
            venue_stat.push(v + ": " + stat.venue[v]);
        }
        $(".venue-stat").html(venue_stat.join("<br>\n"));

        var year_stat = [];
        var year_dict = {};
        table_html.push("<tr><th></th>");
        for(var v in stat.year) {
            year_stat.push(v + ": " + stat.year[v]);
            year_dict[v] = 0;
            table_html.push('<th>' + v + '</th>');
        }
        table_html.push("</tr>");
        $(".year-stat").html(year_stat.join("<br>\n"));

        var author_stat = [];
        for(var a in stat.author) {
            author_stat.push(a + ": " + stat.author[a]);
        }
        $(".author-stat").html(author_stat.join("<br>\n"));

        var table_json = {};
        for(var i in res) {
            var year = res[i]["info"]["year"];
            var area = res[i]["info"]["area"];
            if(!(area in table_json)) {
                table_json[area] = Object.assign({}, year_dict);
            }
            table_json[area][year] += 1;
        }
        for(var i in table_json) {
            table_html.push("<tr><td>" + i + "</td>");
            for(var j in table_json[i]) {
                table_html = table_html.concat([
                    "<td>",
                    table_json[i][j],
                    "</td>"
                ]);
            }
            table_html.push("</tr>");
        }
        table_html.push("</table>");
        $(".stat-table").html(table_html.join("\n"));
    }

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
                $(target).find("label[text]").each(function() {
                    if($(this).attr("text").indexOf(keyword) == -1) {
                        $(this).hide();
                    }
                    else {
                        $(this).show();
                    }
                });
                $(target).find(".panel").each(function() {
                    var num = $(this).find("label[text]:visible").length;
                    if(num == 0) {
                        $(this).hide();
                    }
                });
            }
        });
    },
    Conference: {
        render: function() {
            $.getJSON("conference.json?ts=2020040801", function(data) {
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
                        '        <h3 class="panel-title"><label><input type="checkbox" class="panel-chkbox"> ' + i + '</label></h3>',
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
            $.getJSON("professor.json?ts=2020040801", function(data) {
                var html = [];
                var li = [];
                for(var i in data) {
                    li.push(
                        '<div><label class="professor-label" text="' + data[i].toLowerCase() + '"><input type="checkbox" class="chkbox-professor" value="' + data[i] + '" /> ' + data[i] + ' <span class="paper-count"></span></label></div>'
                    );
                }
                var panel = [
                    '<div class="panel panel-default">',
                    '    <div class="panel-heading">',
                    '        <h3 class="panel-title"><label><input type="checkbox" class="panel-chkbox"> NCTU</label></h3>',
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
