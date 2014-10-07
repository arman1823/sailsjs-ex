module.exports = {

    userAddPost: function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') }
        var __ = res.i18n;
        PrivateChats.findOne({ creator_id: req.session.user }).exec(function(privateChatErr, privateChatRes) {
            var data = {
                user_id: req.body.user_id,
                chat_id: privateChatRes.id
            };
            PrivateChatUsers[req.body.remove ? "destroy" : "create"](data).exec(function(pcUserErr, pcUserRes) {
                if ( pcUserErr ) {
                    return res.json({ status: false, message: __("private_chat_add_error") });
                } else {
                    return res.json({ status: true, message: __("private_chat_add_success"), chat_user_id: pcUserRes.id });
                }
            });
        });
    },

    _config: {}

  
};