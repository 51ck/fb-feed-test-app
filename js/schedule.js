(function() {
    var template = _.template(document.querySelector('#template').innerHTML)
        , schedule = document.querySelector('div.schedule')
        ;

    var week = [
        {day: "пн", atwork: "10:00", athome: "19:00", lunch: "13:00"}
        , {day: "вт", atwork: "8:00", athome: "17:00", lunch: "12:00"}
        , {day: "ср", atwork: "8:00", athome: "17:00", lunch: "12:00"}
        , {day: "чт", atwork: "10:00", athome: "19:00", lunch: "13:00"}
        , {day: "пт", atwork: "10:00", athome: "19:00", lunch: "none"}
        , {day: "сб", atwork: "9:00", athome: "15:00", lunch: "none"}
        , {day: "вс", atwork: "9:00", athome: "15:00", lunch: "none"}
    ];

    schedule.innerHTML = template({ week: week });

})();