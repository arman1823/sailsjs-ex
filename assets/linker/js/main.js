var prototypeSel = "#element_prototypes";

var init_message_system = function(data) {
    data = data.split(',');
    var roomData = {
        room: data? data[2] : '',
        roomData0: parseInt(data? data[0] : ''),
        roomData1: parseInt(data? data[1] : '')
    };
    socket.post('/messages/room', roomData, function(res) {
        console.log('Created Messages Chat Room');
    });
}

var generic_message_system = function(el) {
    var inbox;
    $(".audio-message-player, .video-message-player").each(function() {
        jinit($(this));
    });

    //****Message File Upload via Ajax****
    var message_file_action, message_file_action_original, form;
    $(".message-file div[class$=-message]").click(function(event) {
        event.preventDefault();
        form = $(this).parents('form');
        message_file_action_original = form.attr('action');
        message_file_action = message_file_action_original.split('?')[0] + '/' + $(this).attr('name') + '?' + message_file_action_original.split('?')[1];
        form.find('.messages-file-container').trigger('click');
    });

    function error_message(error) {
        $(form.attr('rel')).html(error);
    };

    $(".messages-file-container").change(function(event) {
        event.preventDefault();
        inbox = $(this).parents('.messages').find('table.message-content');
        form.ajaxSubmit({
            resetForm: true,
            url: message_file_action,
            beforeSubmit: preloader.bind(form, 'show'),
            success: function(res) {
                preloader('hide');
                res.error ? error_message(res.message) : '';
            }
        });
    });

    socket.on('chatMessage', function(res) {
        console.log(res)
        preloader('hide');
        var content = $(res.message);
        inbox.append(content);
        $('.message-box').val('');
        var jelment = content.find('.audio-message-player, .video-message-player');
        if (jelment.length) {
            jinit(jelment.eq(0));
        }
    });


    $('.message-send').click(function(event) {
        event.preventDefault();
        form = $(this).parents('form');
        message_file_action_original = form.attr('action');
        inbox = $(this).parents('.messages').find('table.message-content');
        console.log(inbox.html())
        form.ajaxSubmit({
            resetForm: true,
            url: message_file_action_original,
            beforeSubmit: preloader.bind(form, 'show'),
            success: function(res) {
                preloader('hide');
                res.error ? error_message(res.message) : '';
            }
        });
    });
}

var EC = {};

EC.Messages = function(el) {
    generic_message_system(el);
};

EC.Groups = function() {
    $(window).bind("resize", groupPanelSizeNormalize);
    $(document).bind("ready", groupPanelSizeNormalize);
    var adminGroupIds = [];
    var groupsList = $("#groups-list");
    groupsList.find("> a").on("click", function(e) {
        e.preventDefault();
        groupsList.find("> div").toggleClass("hide");
    });

    var fadeLeaveGroup = function(groupId) {
        $('.jquery-window[data-group-id="' + groupId + '"]').fadeOut("slow", function() {
            $(this).remove();
        });
    };

    var promoteToAdmin = function(groupId, userId) {
        var userRow = $(".userslist-wrap-" + groupId + ' .actions-holder[data-user-id="' + userId + '"]').parents("li").eq(1);
        var adminParent = $(".adminlist-wrap-" + groupId + ' .adminlist');
        userRow.find(".glyphicon-user").addClass("active");
        userRow.appendTo(adminParent);
        $('.jquery-window[data-group-id="' + groupId + '"] .custom-popover').popover('hide');
    };

    var demoteFromAdmin = function(groupId, userId) {
        var adminRow = $(".adminlist-wrap-" + groupId + ' .actions-holder[data-user-id="' + userId + '"]').parents("li").eq(1);
        var userParent = $(".userslist-wrap-" + groupId + ' .userslist');
        adminRow.find(".glyphicon-user").removeClass("active");
        adminRow.appendTo(userParent);
        $('.jquery-window[data-group-id="' + groupId + '"] .custom-popover').popover('hide');
    };

    var initWinPos = 0;
    groupsList.find(".group-win-trigger > a").each(function() {
        var groupId = parseInt($(this).attr("data-group-id"));
        var newWindow = $(".group-windows").windows({
            title: $(this).attr("data-group-name"),
            content: $('[rel="group-table-' + groupId + '"]').html(),
            left: initWinPos,
            width: 400,
            height: $(window).height() - 200,
            middleClickDrag: true,
            onLoad: function(win) {
                win.attr("data-group-id", groupId).find('.content-inner').css({
                    height: $(window).height() - 420
                });
            },
            beforeClose: function() {
                var groupId = parseInt(this.attr("data-group-id"));
                var isAdmin = ! ( adminGroupIds.indexOf(groupId) === -1 );
                var confirmText = isAdmin ? "vote for the group close" : "leave the group";
                bootbox.confirm("Are you sure you want to " + confirmText + "?", function(res) {
                    if ( res ) {
                        socket_request(
                            "/vote/close", { group_id: groupId }, {
                                before: preloader.bind($("body"), 'show'),
                                after: function(res) {
                                    if ( res.status ) {
                                        if ( isAdmin ) {
                                            bootbox.alert("You have closed the group successfully.");
                                        }
                                        fadeLeaveGroup(groupId);
                                    }
                                    preloader.call($("body"), 'hide');
                                }
                            }
                        );
                    }
                });
            }
        });
        initWinPos += 400;
        $(this).on("click", function(e) {
            e.preventDefault();
            if (newWindow.hasClass("minimized")) {
                $.windows.unminimize(newWindow, {
                    unMinimizeSpeed: 300,
                    beforeUnMinimize: function() {
                        this.show();
                        return true;
                    }
                });
            } else {
                $.windows.minimize(newWindow, {
                    minimizeSpeed: 300,
                    afterMinimize: function() {
                        this.hide();
                    }
                });
            }
        });
    });
    $(".like-box a.vote-link").on("click", function(e) {
        e.preventDefault();
        var voteType = $(this).attr("rel");
        if (!voteType) return;
        var $voteCaller = $(this);
        socket_request(
            $voteCaller.attr('href'), {
                voteType: voteType
            }, {
                before: preloader.bind($voteCaller, 'show'),
                after: function() {
                    $voteCaller.parent().find("a.vote-link").addClass("hide");
                    $voteCaller.parents(".like-box").find('.liked-response .vote-response[data-voted="' + voteType + '"]').eq(0).removeClass('hide');
                    preloader.call($voteCaller, 'hide');
                }
            }
        );
    });
    $(".spam-box .spam-btn").on("click", function(e) {
        e.preventDefault();
        var $spamCaller = $(this);
        socket_request(
            $spamCaller.attr('href'), { /* no post params */ }, {
                before: preloader.bind($spamCaller, 'show'),
                after: function(res) {
                    $spamCaller.addClass("hide");
                    $spamCaller.parents(".spam-box").find('.spam-response-good').removeClass('hide');
                    preloader.call($spamCaller, 'hide');
                    if ( res.status ) {
                        window.setTimeout(function() {
                            $spamCaller.parents("tr").eq(0).fadeOut("slow");
                        }, 1500);
                    }
                }
            }
        );
    });
    $(document).bind("ready", function() {
//        $('[data-vote="true"]').on("click", function(e) {
//            e.preventDefault();
//            socket_request(
//                "/vote/" + $(this).attr("data-vote-for"), { /* no post params */ }, {
//                    before: preloader.bind($("body"), 'show'),
//                    after: function() {
//                        preloader.call($("body"), 'hide');
//                    }
//                }
//            );
//        });
        $(".user-admin .invite-users").on("click", function() {
            $('input[name="invite_group_id"]').val( $(this).parents(".jquery-window").attr("data-group-id") );
        });
        $("#do_group_invite").on("click", function() {
            var $socketCaller = $(this).parents(".modal-content");
            var inviteIds = [];
            $('.invitation-box:not(.prototype)').find('input[name^="invite_ids"]').each(function() {
                inviteIds.push( $(this).val() );
            });
            socket_request(
                $socketCaller.attr("rel"),
                {
                    groupId: $('input[name="invite_group_id"]').val(),
                    inviteIds: inviteIds
                },
                {
                    before: preloader.bind($socketCaller, 'show'),
                    after: preloader.bind($socketCaller, 'hide'),
                    responseField: $("#group_invite_result")
                }
            );
        });

        var privateChatCounterElem = $(".private-message-tab > a > span");
        var userIdStack = [];
        var privateChatUserCounter = 0;
        var tmpUserId;

        $(".actions-holder").each(function() {
            tmpUserId = $(this).attr("data-user-id");
            if ( tmpUserId && -1 === userIdStack.indexOf(tmpUserId) && $(this).find(".glyphicon-list").hasClass("active") ) {
                privateChatUserCounter++;
                userIdStack.push(tmpUserId);
            }
        });

        privateChatCounterElem.text("" + privateChatUserCounter);

        $(document).on("click", ".actions-holder .glyphicon-list", function(e) {
            e.preventDefault();
            var listIcon = $(this);
            var parentPopoverContent = listIcon.parents(".popover-content").eq(0);
            var userId = listIcon.parents(".actions-holder").eq(0).attr("data-user-id");
            socket_request(
                listIcon.parents(".user-admin").attr("data-pchat-action"),
                {
                    user_id: userId,
                    remove: listIcon.hasClass("active")
                },
                {
                    before: preloader.bind(parentPopoverContent, 'show'),
                    after: function(res) {
                        if ( res.status ) {
                            if ( listIcon.hasClass("active") ) {
                                $('.actions-holder[data-user-id="' + userId + '"] .glyphicon-list').removeClass("active");
                                privateChatCounterElem.text( parseInt(privateChatCounterElem.text()) - 1 );
                            } else {
                                $('.actions-holder[data-user-id="' + userId + '"] .glyphicon-list').addClass("active");
                                privateChatCounterElem.text( parseInt(privateChatCounterElem.text()) + 1 );
                            }
                        }
                        preloader.call(parentPopoverContent, 'hide');
                    }
                }
            );
        });

        var adminPromotionHandler = function($this, promote) {
            var groupId = parseInt($this.parents(".jquery-window").attr("data-group-id"));
            var isAdmin = ! ( adminGroupIds.indexOf(groupId) === -1 );
            var userId = parseInt($this.parents(".actions-holder").eq(0).attr("data-user-id"));
            var userName = $this.parents("li").eq(0).find(".user").text();
            var confirmText;
            if ( promote ) {
                confirmText = "Are you sure you want to vote for promotion of user '" + userName + "' to admin?";
            } else {
                confirmText = "Are you sure you want to vote for demotion of user '" + userName + "' from admin?";
            }
            if ( ! isAdmin ) {
                return bootbox.alert("You are not allowed to take admin actions in this group!");
            }
            bootbox.confirm(confirmText, function(res) {
                if ( res ) {
                    socket_request(
                        "/vote/" + (promote ? "promote" : "demote"), {
                            group_id: groupId,
                            user_id: userId
                        }, {
                            before: preloader.bind($("body"), 'show'),
                            after: function(res) {
                                if ( res.status ) {
                                    if ( isAdmin ) {
                                        bootbox.alert("You have " + (promote ? "promoted" : "demoted") + " the user successfully.");
                                    }
                                    promote ? promoteToAdmin(groupId, userId) : demoteFromAdmin(groupId, userId);
                                }
                                preloader.call($("body"), 'hide');
                            }
                        }
                    );
                }
            });
        };

        $(document).on("click", ".userslist .glyphicon-user", function(e) {
            e.preventDefault();
            adminPromotionHandler( $(this), true );
        });

        $(document).on("click", ".adminlist .glyphicon-user", function(e) {
            e.preventDefault();
            adminPromotionHandler( $(this), false );
        });

        // Subscribe On Current User's Admin Groups
        socket.post('/vote/subscribe', function(res) {
            console.log('Subscribe to vote system:', res);
            adminGroupIds = res.adminGroupIds;
        });

        var voteEvents = {
            groupClose: function(res) {
                this.title = "Group Close Proposal";
                this.message = function(res) {
                    return "Admin '" + res.currentUser.username + "' has proposed to close group '" + res.groupInfo.name + "', do you agree?";
                };
                this.type = "close";
                this.callback = function(res) {
                    if ( res.votePassed ) {
                        fadeLeaveGroup(res.group.id);
                    }
                    bootbox.alert(
                        "Vote for closing the group '" + res.group.name + "' has " +
                        (res.votePassed ? "succeeded" : "failed") +
                        "."
                    );
                };
            },
            adminPromote: function(res) {
                this.title = "Promote To Admin Proposal";
                this.message = function(res) {
                    return "Admin '" + res.currentUser.username + "' has proposed to promote user '" + res.promotableUser.username + "' to admin in group '" + res.groupInfo.name + "', do you agree?";
                };
                this.type = "promote";
                this.callback = function(res) {
                    if ( res.votePassed ) {
                        promoteToAdmin(res.group.id, res.promotableUser.id);
                    }
                    bootbox.alert(
                        "Vote for promoting user '" + res.promotableUser.username + "' to admin in group '" + res.group.name + "' has " +
                        (res.votePassed ? "succeeded" : "failed") +
                        "."
                    );
                };
            },
            adminDemote: function(res) {
                this.title = "Demote From Admin Proposal";
                this.message = function(res) {
                    return "Admin '" + res.currentUser.username + "' has proposed to demote user '" + res.promotableUser.username + "' from being admin in group '" + res.groupInfo.name + "', do you agree?";
                };
                this.type = "demote";
                this.callback = function(res) {
                    if ( res.votePassed ) {
                        demoteFromAdmin(res.group.id, res.promotableUser.id);
                    }
                    bootbox.alert(
                        "Vote for demoting user '" + res.promotableUser.username + "' from being admin in group '" + res.group.name + "' has " +
                        (res.votePassed ? "succeeded" : "failed") +
                        "."
                    );
                };
            }
        };

        var voteInitCallback = function(info, type, event, vote) {
            socket_request(
                "/vote/respond/" + type,
                {
                    groupId: info.groupId,
                    userId: info.userId,
                    vote: vote,
                    respondTo: event
                },
                {
                    before: preloader.bind($("body"), 'show'),
                    after: preloader.bind($("body"), 'hide')
                }
            );
        };

        for ( var event in voteEvents ) {

            (function(event) {

                socket.on("vote" + UC(event), function(res) {

                    var vote = new voteEvents[event](res);

                    switch ( res.type ) {

                        case "initiate":
                            var cbArgs = [{
                                groupId: res.groupInfo.id,
                                userId: null
                            }];
                            if ( res.promotableUser ) {
                                cbArgs[0].userId = res.promotableUser.id;
                            }
                            cbArgs = cbArgs.concat([ vote.type, event ]);
                            bootbox.dialog({
                                title: vote.title instanceof Function ? vote.title(res) : vote.title,
                                message: vote.message instanceof Function ? vote.message(res) : vote.message,
                                buttons: {
                                    no: {
                                        label: "No",
                                        className: "btn-warning",
                                        callback: voteInitCallback.bind.apply( voteInitCallback, [null].concat(cbArgs.concat([false])) )
                                    },
                                    yes: {
                                        label: "Yes",
                                        className: "btn-primary",
                                        callback: voteInitCallback.bind.apply( voteInitCallback, [null].concat(cbArgs.concat([true])) )
                                    }
                                }
                            });
                            break;
                        case "response":
                            preloader.call($("body"), 'hide');
                            vote.callback(res);
                            break;
                        default:
                            console.log("wrong response type for group close:", res);

                    }

                });

            })(event);

        }

    });

    generic_message_system();

};

EC["Invite-lists"] = function() {
    $(document).bind("ready", function() {
        var pageParent = $(".invite_lists");
        pageParent.find(".invitation-boxes").parents(".form-group").eq(0).insertBefore( pageParent.find('[type="submit"]').parents(".form-group").eq(0) );
        var inviteListForm = $("#invite_list_create_form");
        var inviteListTable = $("#invite-list");
        var createListTitle = $("#invite_list_create_title");
        $(".invite_list_edit").on("click", function(e) {
            e.preventDefault();
            var listId = $(this).parents("tr").eq(0).attr("data-list-id");
            socket_request(
                $(this).attr("data-edit-url"),
                {
                    id: listId
                },
                {
                    before: function() {
                        preloader.call(inviteListTable, 'show');
                        $('input[name="edit_remove"]').val("" + listId);
                    },
                    after: function(res) {
                        if ( res.status ) {
                            createListTitle.find(".create").addClass("hide");
                            createListTitle.find(".edit").removeClass("hide");
                            inviteListForm.find('input[name="name"]').val(res.data.name);
                            var users = res.data.users;
                            var invBox;
                            for ( var i in users ) {
                                invBox = $(".invitation-box.prototype").clone();
                                invBox.find("> span").text(users[i].user.username);
                                invBox.find("> input").val(users[i].user.id);
                                invBox.removeClass("prototype hide").appendTo( $(".invitation-boxes") );
                            }
                        }
                        preloader.call(inviteListTable, 'hide');
                    }
                }
            );
        });
        $(".invite_list_delete").on("click", function(e) {
            e.preventDefault();
            var rowParent = $(this).parents("tr").eq(0);
            var listId = rowParent.attr("data-list-id");
            socket_request(
                $(this).attr("data-delete-url"),
                {
                    id: listId
                },
                {
                    before: preloader.bind(inviteListTable, 'show'),
                    after: function(res) {
                        if ( res.status ) {
                            rowParent.fadeOut("slow", function() {
                                $(this).remove();
                            });
                        }
                        preloader.call(inviteListTable, 'hide');
                    }
                }
            );
        });
    });
};

EC.initSortableGroupCategories = function(elem) {
    var obj = elem || $(".sortable1, .sortable2");
    obj.sortable({
        connectWith: ".connectedSortable",
        start: function(event, ui) {
            ui.item.data("from-cat", ui.item.parents("#user_groups").length ? "none" : ui.item.parents("tr").eq(0).attr("data-cat-id"));
        },
        stop: function(event, ui) {
            var $socketCaller = $(this);
            socket_request(
                $("#content .container").attr("data-reorder-url"), {
                    group_id: ui.item.attr("data-group-id"),
                    from_cat: ui.item.data("from-cat"),
                    to_cat: ui.item.parents("tr").eq(0).attr("data-cat-id")
                }, {
                    before: function() {
                        preloader.call($socketCaller, 'show');
                    },
                    after: function(res) {
                        if ( res.status ) preloader.call($socketCaller, 'hide');
                    }
                }
            );
        }
    }).disableSelection();
};

EC.Organize = function() {
    $(document).bind("ready", function() {
        $("#create_group_category").on("click", function(e) {
            e.preventDefault();
            var newCatName = $("#new_category_name").val();
            if ( ! newCatName ) return;
            var $socketCaller = $(this).parents(".create-category-group");
            socket_request(
                $socketCaller.attr("rel"),
                { name: newCatName }, {
                    before: preloader.bind($socketCaller, 'show'),
                    after: function(res) {
                        var catNameField = $("#new_category_name");
                        // TODO: debug EC.initSortableGroupCategories()
                        if ( res.status ) {
                            catNameField.val("");
                            window.location.reload();
                            return;
                        }
                        if ( res.status ) {
                            var newRow = $("#group_category_prototype")
                                          .find("tr")
                                          .clone(true)
                                          .attr("data-cat-id", res.catId)
                                          .appendTo( $("#group_categories") )
                                          .fadeIn();
                            newRow.find("td").eq(0).text(newCatName);
                            EC.initSortableGroupCategories( newRow.find(".sortable2") );
                        }
                        preloader.call($socketCaller, 'hide');
                        catNameField[res.status ? "removeClass" : "addClass"]("error");
                        if ( res.status ) {
                            catNameField.val("");
                        }
                    }
                }
            );
        });
    });
};

var inviteListAfterAdd = function(res) {
    if ( res.status ) {
        var appendParent = $("#invite-list > tbody");
        var listTitleElem = $("#invite_list_create_title");
        var editIdElem = $('input[name="edit_remove"]');
        if ( editIdElem.val() ) {
            appendParent.find('[data-list-id="' + editIdElem.val() + '"]').fadeOut("slow", function() {
                $(this).remove();
            });
            listTitleElem.find(".edit").addClass("hide");
            listTitleElem.find(".create").removeClass("hide");
            editIdElem.val("");
        }
        var newRow = appendParent.find("> tr:last-child")
                                 .clone(true)
                                 .css("display", "none")
                                 .appendTo(appendParent);
        for ( var i in res.data ) {
            newRow.find("> td").eq(i).text(typeof res.data[i] === "string" ? res.data[i] : res.data[i].join(", "));
        }
        newRow.fadeIn("slow");
        $(".invitation-boxes").html("");
        $('#invite_list_create_form input[type="text"]').val("");
    } else {
        $("#invite_list_create_errors").text(res.message);
    }
};

var afterGroupCreate = function(res) {
    var allFields = $("form#create-group").find("input, textarea");
    allFields.removeClass("error");
    if ( ! res.status && res.reason == "validation_error" ) {
        for ( var i in res.errorFields ) {
            $('input[name="' + i + '"], textarea[name="' + i + '"]').addClass("error");
        }
    }
    if ( res.status ) {
        allFields.val("");
        $(".invitation-boxes:not(.prototype)").html("");
    }
    bootbox.alert(res.message);
};

jQuery(document).ready(function($) {
    var path = window.location.pathname.split('/');
    var pathIndex = 0;
    path = path.filter(Boolean).map(function(el) {
        el = UC(path[pathIndex++]) + UC(el);
        return el;
    });

    //call
    for (var i = path.length - 1; i >= 0; i--) {
        if (EC.hasOwnProperty(path[i])) {
            EC[path[i]](path.slice(i));
            break;
        }
    }

    $('[data-socket="true"]').on("submit", function(e) {
        e.preventDefault();
        var confirmMsg = $(this).attr('data-confirm');
        if (confirmMsg && !confirm(confirmMsg)) return false;
        var $socketCaller = $(this);
        var beforeCallback = $socketCaller.attr("data-socket-before");
        var afterCallback = $socketCaller.attr("data-socket-after");
        socket_request(
            $socketCaller.attr('action'),
            $socketCaller.serializeObject(), {
                before: function() {
                    preloader.call($socketCaller, 'show');
                    if ( beforeCallback ) window[beforeCallback]();
                },
                after: function(res) {
                    preloader.call($socketCaller, 'hide');
                    if ( afterCallback ) window[afterCallback](res);
                },
                redirect: $socketCaller.attr('redirect'),
                responseField: $($socketCaller.attr("rel")),
                responseType: $socketCaller.attr("data-response-type")
            }
        );
    });

    $(".join-action-link").on("click", function(e) {
        e.preventDefault();
        var $socketCaller = $(this);
        socket_request(
            "/groups/join", {
                group_id: $socketCaller.attr("data-group-id")
            }, {
                before: function() {
                    $socketCaller.addClass("invisible");
                    console.log($socketCaller.parent())
                    preloader.call($socketCaller.parent(), 'show');
                },
                after: function(res) {
                    $socketCaller.next(".preloader-wrap").addClass(res.status ? "done" : "warning");
                }
            }
        );
    });

    var notificationHandle = $(".glyphicon-exclamation-sign");

    notificationHandle.on("click", function() {
        $(this).removeClass("active");
    });

    var addNotification = function(res) {
        var message;
        switch ( res.event_type ) {
            case "group_invite":
                message = "User '" + res.fromUser.username + "' has invited you to join group '" + res.forGroup.name + "'";
                break;
        }
        if ( ! message ) return;
        $(".notification-list").append('<li>' + message + '</li>');
    };

    socket.on("pushNotifications", function(res) {
        if ( res.event_type ) {
            addNotification(res);
            if ( $('[rel="ul.notification-list"]').next(".popover").is(":visible") ) {
                $(".custom-popover.notification").popover("show");
            }
            if ( ! notificationHandle.hasClass("active") ) {
                notificationHandle.addClass("active")
            }
        }
    });

    socket.post('/get-notifications', function(res) {
        if ( ! res.status ) return;
        console.log(res.notifications)
        for ( var i in res.notifications ) {
            addNotification(res.notifications[i]);
        }
    });

    socket.post('/subscribe', function(res) {
        console.log('Subscribe to main events:', res);
    });

    var $archiveSearchForm = $("#archive-search");

    $archiveSearchForm.on("submit", function(e) {
        e.preventDefault();
        preloader.call($archiveSearchForm, 'show');
        $.post($archiveSearchForm.attr("action"), {
            q: $archiveSearchForm.find('input[type="text"]').val()
        }, function(res) {
            $( $archiveSearchForm.attr("rel") ).find("tbody").html(res);
            preloader.call($archiveSearchForm, 'hide');
        });
    });

    $(".modal-box").fancybox({
        prevEffect: 'none',
        nextEffect: 'none',
        helpers: {
            title: {
                type: 'inside'
            },
            buttons: {}
        }
    });

    $(document).on("mouseenter", '[data-toggle="tooltip"]', function() {
        $(this).tooltip("show");
    }).on("mouseleave", '[data-toggle="tooltip"]', function() {
        $(this).tooltip("hide");
    });

    $(".jquery-window .content-inner, #groups-list > div").niceScroll();
    $('.jquery-tabs').easytabs();


    $('#menu-sidebar .sub-menu').each(function(index) {
        $(this).prev().addClass('collapsible').click(function() {
            if ($(this).next().css('display') == 'none') {
                $(this).next().slideDown(600, function () {
                    $(this).prev().removeClass('collapsed').addClass('expanded');
                });
            }else {
                $(this).next().slideUp(200, function () {
                    $(this).prev().removeClass('expanded').addClass('collapsed');
                    $(this).find('ul').each(function() {
                        $(this).hide().prev().removeClass('expanded').addClass('collapsed');
                    });
                });
            }
            return false;
        });
    });


    EC.initSortableGroupCategories();

    $('.custom-popover').each(function() {
        var $this = $(this);
        $this.popover({
            html: true,
            content: function() {
                return $( $this.attr("rel") ).html();
            }
        });
    });

    $(".radio-submit").change(function() {
        $(this).parents('form').submit();
    });

    $("#create-group #switch-public-private").on("change", function() {
        var isPublic = $('input[name="is_public"]:checked').val() == 1;
        $('.form-group-public')[isPublic ? 'show' : 'hide']();
        $('.form-group-private')[isPublic ? 'hide' : 'show']();
    });

    $("input.autocomplete").each(function() {
        var $this = $(this);
        $this.autocomplete({
            serviceUrl: $this.attr("data-autocomplete-url"),
            onSelect: function(suggestion) {
                addInviteBox(parseInt(suggestion.data), suggestion.value);
            }
        });
    });

    $(document).on("click", ".invitation-box .remove", function(e) {
        e.preventDefault();
        $(this).parent().remove();
    });

    $(document).on("submit", "#public-user-search", function(e) {
        $("#public-search-results").removeClass("hide");
    });

    $(document).on("click", "#public-search-results tbody .invite-action-link", function(e) {
        e.preventDefault();
        addInviteBox($(this).attr("data-user-id"), $(this).attr("data-user-name"));
    });

    $(document).on("click", "#group-join-dialog .groups-link", function(e) {
        e.preventDefault();
        window.location.href = '/groups';
    });

    var path = window.location.pathname;
    $(".navbar-collapse .nav li a").each(function() {
        var href = $(this).attr('href');
        if (path == href) {
            $(this).closest('li').addClass('active');
        };
    });

    $('.breadcrumb li').last().children().addClass('active').removeAttr('href');

});