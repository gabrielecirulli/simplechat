$(document).ready(function () {
    var socket        = io.connect("http://" + location.host),
        welcomeBlock  = $(".chatBody .welcomeBlock"),
        nicknameForm  = welcomeBlock.find(".nicknameForm"),
        nicknameInput = nicknameForm.find(".nicknameInput"),
        chatBlock     = $(".chatBody .chatBlock"),
        messageList   = chatBlock.find(".messageList"),
        messageForm   = chatBlock.find(".messageForm"),
        lenIndicator  = messageForm.find(".indicator"),
        messageInput  = messageForm.find(".messageInput"),
        maxLength     = 400,
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
    messageInput.keyup(function () {
        var text       = $(this).val(),
            textLength = text.length,
            remaining  = maxLength - textLength;

        if (textLength === 0) {
            lenIndicator.text("");
        } else {
            lenIndicator.text(remaining);
            lenIndicator.attr("class", remaining < 0 ? "bad" : "");
        }
    });

    messageForm.submit(function (e) {
        var message = messageInput.val().trim();

        e.preventDefault();

        if (message) {
            socket.emit("message", { message: message });
            messageInput.val("");
            messageForm.find(".error").remove();
        }
    });

    // Receive messages
    socket.on("message", function (data) {
        if (entered) {
            addMessage(data, data.external);
        }
    });

    // Message error
    socket.on("message response", function (data) {
        var errorParagraph = $(document.createElement("p")).addClass("error").text(data.message);
        messageForm.append(errorParagraph);
    });

    // Receive information
    socket.on("info", function (data) {
        console.log(data);
        if (entered) {
            addInfo(data);
        }
    });

    // Other functions
    function addMessage (data, external) {
        var message       = $(document.createElement("li"))
                                .addClass("message " + (external ? "external" : "internal")),
            textContainer = $(document.createElement("div"))
                                .text(data.message)
                                .css({ backgroundColor: data.color })
                                .attr("data-color", data.color),
            textTip       = $(document.createElement("div"))
                                .addClass("tip")
                                .css({ borderColor: data.color }),
            userContainer = $(document.createElement("div"))
                                .text(data.nickname);

        textContainer.addClass("text");
        textContainer.append(textTip);
        userContainer.addClass("nickname");

        if (external) {
            message.append(textContainer, userContainer);
        } else {
            message.append(userContainer, textContainer);
        }

        messageList.append(message);

        scrollList();
    }

    function addInfo (data) {
        console.log(data);
        var infoBox = $(document.createElement("li")).addClass("info");

        infoBox.text(data.message);

        messageList.append(infoBox);

        scrollList();
    }

    function scrollList () {
        messageList.scrollTop(messageList[0].scrollHeight);
    }
});
