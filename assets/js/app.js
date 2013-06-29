document.addEventListener("DOMContentLoaded", function () {
    var socket = io.connect("http://" + location.host);

    $(".nicknameForm").submit(function (e) {
        var welcomeBlock  = $(".welcomeBlock"),
            chatBlock     = $(".chatBlock")
            nicknameField = $(".nickname"),
            nickname      = nicknameField.val().trim();
        e.preventDefault();
        
        nicknameField.blur();
        if (nickname) {
            welcomeBlock.addClass("hidden");
            setTimeout(function () {
                welcomeBlock.remove();
                socket.emit("enter", { nickname: nickname });
                socket.on("accepted", function () {
                    chatBlock.removeClass("hidden");
                });                
            }, 500);
        } else {
            // Handle error
        }
    });
});
