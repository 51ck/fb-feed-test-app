(function() {
    window.fbAsyncInit = function() {
        FB.init({
            appId: '619064858288669',
            xfbml: true,
            version: 'v2.8'
        });
        FB.AppEvents.logPageView();
    };

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "http://connect.facebook.net/ru/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));


    var out = document.querySelector('#out')
        , authButton = document.querySelector('#auth')
        , avatara = 'test'
        ;

    var callback = function(response) {
        if (response.authResponse) {
            console.log("Welcome...");
            FB.api("/me", function(response) {
               console.log('Good to see you, ' + response.name + '.');
               console.log(response);
            });

            FB.api('/me/picture', function(response) {
                var avatara = response.data.url;
                alert(1);
                console.log(avatara);
                // document.querySelector('#userpic').setAttribute('src', avatara);
            });
            
            alert(2);
            document.querySelector('#userpic').setAttribute('src', avatara);
            alert(document.querySelector('#userpic').getAttribute('src'));

            FB.api('/me/feed', {"fields": "id,story,name,link,full_picture,picture,message,caption,created_time", "limit": "25"}, function(response) {
                var tmplt = _.template(document.querySelector('#list-template').innerHTML)
                    , feedList = document.querySelector('#feed')
                    ;
                console.log(response);
                _.each(response.data, function(post, index, list){
                    console.log(Date.parse(post.created_time));
                });

                feedList.innerHTML = tmplt({postArray: response.data});
            });

        } else {
            alert("You shall not pass!");
        }
        out.innerText = response.authResponse.accessToken;
        console.log(response);
    };

    function myFacebookLogin() {
        FB.login(callback, {scope: 'user_posts'});
    };

    authButton.onclick = function () {
        myFacebookLogin()
    };
})();