var MessageService = {};

MessageService.getMessages = function(options, target_id, cb) {
    var reverse = !! (options.from_username && options.reverse);
    var query = "SELECT *, m.`id` AS messageId, m.`createdAt` AS messageDate";
    if ( options.currentUserId ) {
        query += ", mr.`rate_id` AS myRateId, r.`rate` AS myRate";
    }
    query += " FROM ";
    query += options.last ? " (SELECT * FROM `messages` ORDER BY `createdAt` ASC, `from_user_id` DESC) " : " `messages` ";
    query += "AS m INNER JOIN `users` AS u ON m.`from_user_id` = u.`id` " +
			 "INNER JOIN `user_data` AS ud ON u.`id` = ud.`user_id` ";
    if ( options.currentUserId ) {
        query += "LEFT JOIN `message_rating` AS mr " +
                 "ON m.`id` = mr.`message_id` AND mr.`user_id` = " + options.currentUserId + " " +
                 "LEFT JOIN `rating` AS r " +
                 "ON mr.`rate_id` = r.`id` ";
    }
    query += "WHERE ";
    if ( reverse ) query += "(";
    query += "m.`to_" + options.target + "_id` = " + target_id + " ";
    if ( options.from_username ) {
        query += "AND u.`username` = '" + options.from_username + "' ";
    }
    if ( reverse ) {
        query += ") OR (m.`to_" + options.target + "_id` = (SELECT `id` FROM `users` WHERE `username` = '" + options.from_username + "') ";
        query += "AND m.`from_user_id` = " + target_id + ") ";
    }
    query += options.last ? "GROUP BY m.`from_user_id`" : "ORDER BY m.`createdAt` ASC";
    Messages.query(query, cb);
};

module.exports = MessageService;
