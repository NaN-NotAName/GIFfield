appPlayer.controller('HomeController', ['$scope', 'socket',
        function($scope, socket) {
            // Sound manager is a audio player library with hundreds of methods available,
            // The setup we have should be enough for a MVP.


            /// chat controller stuff
            $scope.user = false;
            $scope.typing = false;
            $scope.TYPING_TIMER_LENGTH = 2000; // this is how quick the "[other user] is typing" message will go away
            $scope.chatSend = function() {
                socket.emit('chat message', $scope.chatMsg);
                $scope.chatMsg = "";
                return false;
            }

            $scope.chatMessages = [];

            socket.on('chat message', function(msg) {
                console.log('on is listening');
                $scope.chatMessages.push(msg);
            });

            $scope.setName = function() {
                $scope.user = true;
                socket.emit('username', $scope.screenName);
            };

            socket.on("playNpause", function(obj) {
                console.log('we heard you', obj);
            });

            $scope.updateTyping = function() {
                $scope.typing = true;
                socket.emit('typing', $scope.name);
                var lastTypingTime = (new Date()).getTime();

                setTimeout(function() {
                    var typingTimer = (new Date()).getTime();
                    var timeDiff = typingTimer - lastTypingTime;
                    if (timeDiff >= $scope.TYPING_TIMER_LENGTH && $scope.typing) {
                        socket.emit('stop typing');
                        $scope.typing = false;
                    }
                }, $scope.TYPING_TIMER_LENGTH);
            };

            // Whenever the server emits 'typing', show the typing message
            socket.on('typing', function(data) {

                data.typing = true;
                $scope.typingMessage = data.name + " is typing";

                if (!$scope.chatMessages.includes($scope.typingMessage)) {
                    $scope.chatMessages.push($scope.typingMessage);
                }


            });

            // Whenever the server emits 'stop typing', kill the typing message
            socket.on('stop typing', function(data) {
                data.typing = false;

                var i = $scope.chatMessages.indexOf($scope.typingMessage);
                $scope.chatMessages.splice(i, 1);
            });


            soundManager.setup({
                onready: function() {
                    var mySound,
                        showHidePlay;

                    mySound = soundManager.createSound({
                        url: 'http://server6.mp3quran.net/arkani/001.mp3'
                    });
                    $('.showPlay').on('click', function() {
                        mySound.play();
                        $('.showPlay').hide();
                        $('.showPause').click(function() {
                            $('.showPlay').show();
                            mySound.pause();
                        });
                    });
                }
            })
        }
    ])
    .factory('socket', function($rootScope) {
        var socket = io.connect();
        return {
            on: function(eventName, callback) {
                socket.on(eventName, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function(eventName, data, callback) {
                socket.emit(eventName, data, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    })
                })
            }
        };
    });
