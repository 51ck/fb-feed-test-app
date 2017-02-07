(function() {
    var template = _.template(document.querySelector('#template').innerHTML)
        , schedule = document.querySelector('div.schedule')
        ;

    schedule.innerHTML = template();

})();