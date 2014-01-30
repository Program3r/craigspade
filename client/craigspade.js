(function ($) {
    $(document).ready(function () {
        var dataLoaded = {};
        $.getJSON(window.location + "json/regions",

        function (data) {
            var source = $("#body").html();
            var template = Handlebars.compile(source);
            $("body").append(template(data));
            $('#regions').isotope({
                // options
                itemSelector: '.site',
                layoutMode: 'fitRows'
            });
            $('#states').isotope({
                // options
                itemSelector: '.site',
                layoutMode: 'masonry',
                filter: '.selected'
            });
            dataLoaded = data;
            var db = [];
            db["jobs"] = [];

            function addJob(JobFunction) {
                db["jobs"].push({
                    'function': function () {
                        db["jobs"][0]["status"] = "running";
                        JobFunction(

                        function () {
                            db["jobs"].splice(0, 1);
                            if (typeof db["jobs"][0] == "object") {
                                if (typeof db["jobs"][0]["function"] == "function") {
                                    db["jobs"][0]["function"]();
                                }
                            }
                        });
                    },
                    'status': 'waiting'
                });
                if (db["jobs"][0]["status"] == 'waiting') {
                    db["jobs"][0]["function"]();
                }
            }
            $('#regions .site').click(function () {
                $(this).toggleClass('active');
                var region = $(this).find('.region').attr('data-region');
                $("#states [data-region='" + region + "']").toggleClass('selected');
                $('#states').isotope({
                    filter: '.selected'
                });
            });
            $("#states .site .selectable").selectable();
            $('#states .state').click(function () {
                $(this).addClass('ui-selectee ui-selected');
            });
            $("#selectall").click(function () {
                $("#states .ui-widget-content").addClass('ui-selectee ui-selected');
            });
            $("#selectnone").click(function () {
                $("#states .ui-widget-content").removeClass('ui-selectee ui-selected');
            })
            $("#searchbtn").click(function () {
                $(".ui-widget-content.ui-selected").each(function () {
                    var city = $(this);
                    addJob(function (finish) {
                        var regionName = city.parent().parent().attr('data-region');
                        var stateName = city.parent().parent().find('h5').text();
                        var cityData = dataLoaded[regionName].states[stateName].cities[city.text()]
                        var cityUrl = "/json/city?city=" + cityData.url + "&q=" + $("#search").val();
                        console.log('Searching', cityUrl);
                        $.ajax({
                            url: cityUrl,
                            success: function (data) {
                                //console.log(data);
                                var cityFibers = [];

                                function addJob(JobFunction) {
                                    cityFibers.push({
                                        'function': function () {
                                            cityFibers[0]["status"] = "running";
                                            JobFunction(

                                            function () {
                                                cityFibers.splice(0, 1);
                                                if (typeof cityFibers[0] == "object") {
                                                    if (typeof cityFibers[0]["function"] == "function") {
                                                        cityFibers[0]["function"]();
                                                    }
                                                }
                                            });
                                        },
                                        'status': 'waiting'
                                    });
                                    if (cityFibers[0]["status"] == 'waiting') {
                                        cityFibers[0]["function"]();
                                    }
                                }
                                $.each(data, function (index, val) {
                                    addJob(function (cityFiber) {
                                        counter = 0;
                                        $.ajax({
                                            url: '/json/reply?post=' + val.url,
                                            success: function (dataPost) {
                                                var replyFiber = [];
                                                counter++;
                                                console.log(dataPost[1], index + 1 + " / " + data.length)

                                                try {
                                                    if(dataPost[0].indexOf('undefined') > -1){
                                                        cityFiber();
                                                    }else{
                                                        $.ajax({
                                                            url: '/json/email?reply=' + dataPost[0],
                                                            success: function (dataReply) {

                                                                $("#emails").append("<div>"+dataReply+"</div>");
                                                                console.log(dataReply);
                                                                cityFiber();
                                                            }
                                                        }).fail(function(){
                                                            cityFiber();
                                                        })
                                                    }
                                                }
                                                catch (e) {
                                                    //catch and just suppress error
                                                }
                                                if(index+1 == data.length){
                                                    finish();
                                                }

                                            }
                                        });
                                    });
                                })



                                //finish();
                                //cityFiber();
                                //

                            }
                        });
                    });
                });
            });
        });
    });
})(jQuery);