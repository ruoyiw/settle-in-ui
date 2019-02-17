// Endpoints path
var appUrl = 'https://ho1k9awhxg.execute-api.us-east-1.amazonaws.com/dev';
// URL of next page
var nextPage = 'index.html';
var errorMessage ='We had a problem saving your data, please try again in a moment or contact luke@portable.com.au.';

/*
* Creates a cookie
*/
function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        expires = "; expires="+date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name+"="+value+expires+"; path=/";
}

/*
* Loads a user from the backend
*/
function loadUser() {
    if ($('#email').val() === '') {
        $(".emailWarning").css("visibility", "visible");
    } 
    else {
       $(".emailWarning").css("visibility", "hidden");
       $('body').css("opacity", 0.3);
       $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                name: $('#name').val(),
                email: $('#email').val(),
                organisation: $('#organisation').val(),
                role: $('#role').val()
            }),
            dataType: 'json',
            success: function(data){
                var u = (Array.isArray(data)) ? data[0] : data;
                console.log("Loaded user.", u);
                createCookie('userId', u['email'], 1);
                document.location.href = nextPage;
            },
            error: function(){
                console.log("Failed to load user");
                alert(errorMessage);
                $('body').css("opacity", 1);
            },
            processData: false,
            type: 'POST',
            url: appUrl + '/user/create'
        }); 
    }
    
}