module.exports = {

    "invitations": function(req, res) {
        var kw = req.query.query;
        var query = "SELECT gi.`to_user_id` AS `data`, " +
                    "u.`username` AS `value` " +
                    "FROM `group_invitations` AS gi " +
                    "JOIN `users` AS u ON gi.`to_user_id` = u.`id` " +
                    "WHERE gi.`from_user_id` = " + req.session.user + " " +
                    "AND u.`username` LIKE '%" + kw + "%'";
        GroupInvitations.query(query, function(err, data) {
            return res.json({
                query: kw,
                suggestions: data
            });
        });
    },
  _config: {}

  
};
