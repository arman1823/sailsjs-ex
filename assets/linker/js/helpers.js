$.fn.serializeObject = function(){
    var self = this,
        json = {},
        push_counters = {},
        patterns = {
            "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
            "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
            "push":     /^$/,
            "fixed":    /^\d+$/,
            "named":    /^[a-zA-Z0-9_]+$/
        };
    this.build = function(base, key, value){
        base[key] = value;
        return base;
    };
    this.push_counter = function(key){
        if(push_counters[key] === undefined){
            push_counters[key] = 0;
        }
        return push_counters[key]++;
    };
    $.each($(this).serializeArray(), function(){
        // skip invalid keys
        if(!patterns.validate.test(this.name)){
            return;
        }
        var k,
            keys = this.name.match(patterns.key),
            merge = this.value,
            reverse_key = this.name;

        while((k = keys.pop()) !== undefined){
            // adjust reverse_key
            reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');
            // push
            if(k.match(patterns.push)){
                merge = self.build([], self.push_counter(reverse_key), merge);
            }
            // fixed
            else if(k.match(patterns.fixed)){
                merge = self.build([], k, merge);
            }
            // named
            else if(k.match(patterns.named)){
                merge = self.build({}, k, merge);
            }
        }

        json = $.extend(true, json, merge);
    });

    return json;
};

function UC(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Jplayer
function jinit(el) {
    var src = el.attr('data')
        , ext = src.split('.')[src.split('.').length - 1].toLowerCase()
        , mediaData = {};
    mediaData[ext] = src;
    el.jPlayer({
        ready: function () {
            $(this).jPlayer("setMedia", mediaData);
        },
        swfPath: "/bower_components/jplayer/jquery.jplayer/Jplayer.swf",
        supplied: ext,
        cssSelectorAncestor: "#" + el.next().attr('id')
    });
};

function preloader(visibility) {
    switch ( visibility ) {
        case 'show':
            var parentWidth = this.outerWidth();
            var parentHeight = this.outerHeight();
            $(prototypeSel).find(".preloader-wrap")
                .clone()
                .removeClass("prototype")
                .css({
                    marginTop: -1 * parentHeight,
                    height: parentHeight,
                    width: parentWidth
                }).show().appendTo(this);
            break;
        case 'hide':
            $(".preloader-wrap:not(.prototype)").remove();
            break;
        default:
            break;
    }
};

function socket_request(url, data, options) {
    opts = _.merge({
        before: function() {},
        after: function() {},
        redirect: false,
        responseField: false,
        responseType: ''
    }, options || {});
    if ( opts.responseField ) {
        if ( opts.responseType == "table" ) {
            var tbody = opts.responseField.find("tbody").html('');
        } else {
            opts.responseField.html('').removeClass('success failure');
        }
    }
    opts.before();
    socket.post(url, data, function(res) {
        if ( opts.responseField ) {
            if ( opts.responseType == "table" ) {
                var newRow, inviteLink = '', inviteLinkPrototype;
                for ( var i in res ) {
                    newRow = $('<tr />').appendTo(tbody);
                    for ( var j in res[i] ) {
                        if ( j != "id" ) newRow.append('<td>' + res[i][j] + '</td>');
                    }
                    inviteLinkPrototype = $('.invite-action-link.prototype');
                    if ( inviteLinkPrototype.length ) {
                        inviteLink = inviteLinkPrototype
                                     .clone()
                                     .removeClass("prototype hide")
                                     .attr("data-user-id", res[i]["id"])
                                     .attr("data-user-name", res[i]["username"]);
                        $('<td />').appendTo(newRow).append(inviteLink);
                    }
                }
            } else {
                if ( res.message ) {
                    bootbox.alert(res.message);
                }
//                opts.responseField.html(res.message).addClass(res.status ? 'success' : 'failure');
            }
        }
        opts.after(res);
        if ( opts.redirect && res.status ) {
            window.location.href = opts.redirect;
        }
    });
};

var addInviteBox = function(userId, userName) {
    if ( $("#invitation-box-" + userId).length ) return;
    var inviteBox = $(".invitation-box.prototype")
                       .clone()
                       .removeClass("prototype hide")
                       .attr("id", "invitation-box-" + userId)
                       .appendTo( $(".invitation-boxes") );
    inviteBox.find("> span").text(userName);
    inviteBox.find('> input[type="hidden"]').val(userId);
};

var groupPanelSizeNormalize = function() {
    var $userGroups = $(".user-groups");
    var groupTaskBarHeight = $userGroups.find(".group-taskbar").outerHeight(true);
    $userGroups.find(".group-windows").height( $(window).height() - groupTaskBarHeight - $("#header").outerHeight(true) );
};