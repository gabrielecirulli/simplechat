document.addEventListener("DOMContentLoaded", function () {
    var socket        = io.connect("http://" + location.host),
        welcomeBlock  = $(".chatBody .welcomeBlock"),
        nicknameForm  = welcomeBlock.find(".nicknameForm"),
        nicknameInput = nicknameForm.find(".nicknameInput"),
        chatBlock     = $(".chatBody .chatBlock"),
        messageList   = chatBlock.find(".messageList"),
        messageForm   = chatBlock.find(".messageForm"),
        messageInput  = messageForm.find(".messageInput"),
        entered       = false;

    $(".nicknameForm").submit(function (e) {
        var nickname = nicknameInput.val().trim();

        e.preventDefault();
        
        if (nickname) {
            socket.emit("enter", { nickname: nickname });

            socket.on("enter response", function (data) {
                if (data.accepted) {
                    console.log("ACCEPTED");

                    entered = true;

                    nicknameForm.find(".error").addClass("hidden");
                    nicknameInput.blur();
                    welcomeBlock.addClass("hidden");

                    setTimeout(function () {
                        welcomeBlock.remove();
                        chatBlock.removeClass("hidden");
                        messageInput.focus();
                    }, 500);
                } else {
                    console.log("REJECTED: " + data.message);
                    nicknameForm.find(".error").remove();
                    var errorParagraph = $(document.createElement("p")).addClass("error").text(data.message);
                    nicknameForm.append(errorParagraph);
                }
            });
        }
    });

    // Send messages
    messageForm.submit(function (e) {
        var message = messageInput.val().trim();

        e.preventDefault();

        if (message) {
            socket.emit("message", { message: message });
            messageInput.val("");
        }
    });

    // Receive messages
    socket.on("message", function (data) {
        console.log(data);
        if (entered) {
            addMessage(data, data.external);
        }
    });

    // Other functions
    function addMessage (data, external) {
        console.log(external);
        var message       = $(document.createElement("li")).addClass("message " + (external ? "external" : "internal")),
            textContainer = $(document.createElement("div")).text(data.message).css({ backgroundColor: data.color }),
            userContainer = $(document.createElement("div")).text(data.nickname);

        textContainer.addClass("text");
        userContainer.addClass("nickname");

        if (external) {
            message.append(userContainer, textContainer);
        } else {
            message.append(textContainer, userContainer);
        }

        messageList.append(message);
    }
});
