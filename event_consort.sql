-- MySQL dump 10.13  Distrib 5.5.38, for debian-linux-gnu (i686)
--
-- Host: localhost    Database: event_consort
-- ------------------------------------------------------
-- Server version	5.5.38-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `group_categories`
--

DROP TABLE IF EXISTS `group_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_categories`
--

LOCK TABLES `group_categories` WRITE;
/*!40000 ALTER TABLE `group_categories` DISABLE KEYS */;
INSERT INTO `group_categories` VALUES (4,'test cat 1','2014-07-15 14:07:58','2014-07-15 14:07:58',1);
/*!40000 ALTER TABLE `group_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_invitations`
--

DROP TABLE IF EXISTS `group_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_invitations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `viewed` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `from_group_id` int(11) DEFAULT NULL,
  `from_user_id` int(11) DEFAULT NULL,
  `to_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_invitations`
--

LOCK TABLES `group_invitations` WRITE;
/*!40000 ALTER TABLE `group_invitations` DISABLE KEYS */;
INSERT INTO `group_invitations` VALUES (1,0,NULL,NULL,1,1,3),(2,0,NULL,NULL,2,4,1),(3,0,NULL,NULL,1,1,5),(4,0,NULL,NULL,3,4,1),(5,0,'2014-08-06 17:09:49','2014-08-06 17:09:49',1,1,5);
/*!40000 ALTER TABLE `group_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_users`
--

DROP TABLE IF EXISTS `group_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `join_date` datetime DEFAULT NULL,
  `leave_date` datetime DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_users`
--

LOCK TABLES `group_users` WRITE;
/*!40000 ALTER TABLE `group_users` DISABLE KEYS */;
INSERT INTO `group_users` VALUES (2,NULL,NULL,'admin',NULL,'2014-08-01 21:24:16',1,2),(3,NULL,NULL,'admin',NULL,NULL,1,3),(4,NULL,NULL,'user',NULL,NULL,1,4),(5,NULL,NULL,'user',NULL,NULL,3,3),(6,NULL,NULL,'admin',NULL,NULL,3,4),(7,NULL,NULL,'admin',NULL,NULL,3,1),(8,NULL,NULL,'user',NULL,NULL,4,1),(10,NULL,NULL,'user',NULL,NULL,1,1),(11,NULL,NULL,'admin',NULL,NULL,5,3),(12,NULL,NULL,'admin',NULL,'2014-08-03 14:17:20',5,2),(13,NULL,NULL,'user',NULL,NULL,4,2),(14,NULL,NULL,'user',NULL,'2014-08-01 22:08:36',3,2),(20,'2014-08-05 20:14:11',NULL,'admin','2014-08-05 20:25:14','2014-08-05 20:25:14',1,8);
/*!40000 ALTER TABLE `group_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `creator_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES (1,'group 1',1,1,NULL,NULL,NULL,NULL,1),(2,'group 2',1,1,NULL,NULL,NULL,NULL,3),(3,'archived group 1',1,1,NULL,'2014-05-14 00:00:00',NULL,NULL,1),(4,'archived group 2',0,1,'test_pass','2014-06-11 00:00:00',NULL,NULL,1),(8,'uncategorized group 1',1,1,NULL,NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invite_list_users`
--

DROP TABLE IF EXISTS `invite_list_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invite_list_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `list_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invite_list_users`
--

LOCK TABLES `invite_list_users` WRITE;
/*!40000 ALTER TABLE `invite_list_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `invite_list_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invite_lists`
--

DROP TABLE IF EXISTS `invite_lists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invite_lists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invite_lists`
--

LOCK TABLES `invite_lists` WRITE;
/*!40000 ALTER TABLE `invite_lists` DISABLE KEYS */;
/*!40000 ALTER TABLE `invite_lists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_rating`
--

DROP TABLE IF EXISTS `message_rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `message_rating` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `message_id` int(11) DEFAULT NULL,
  `rate_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_rating`
--

LOCK TABLES `message_rating` WRITE;
/*!40000 ALTER TABLE `message_rating` DISABLE KEYS */;
INSERT INTO `message_rating` VALUES (1,'2014-08-03 13:15:04','2014-08-03 13:15:04',5,4,1);
/*!40000 ALTER TABLE `message_rating` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message_type` varchar(255) DEFAULT NULL,
  `message_body` longtext,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `from_user_id` int(11) DEFAULT NULL,
  `to_user_id` int(11) DEFAULT NULL,
  `to_group_id` int(11) DEFAULT NULL,
  `to_chat_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,'text','test message 1 goes here',NULL,NULL,1,NULL,1,NULL),(2,'text','test message 2 goes here',NULL,NULL,1,NULL,1,NULL),(3,'text','test message 111 goes here',NULL,NULL,1,NULL,2,NULL),(4,'text','test message 2222 goes here',NULL,NULL,1,NULL,2,NULL),(5,'text','asdas asdasdasd asdasdasdadasdasdasd',NULL,NULL,3,NULL,3,NULL),(6,'text','qiuywutyqwyturqyqyruty uquryqurt 2qurqyueuqyewt',NULL,NULL,1,NULL,3,NULL),(7,'text','qqqqqqqqqqq qqqqqq qqqqqqqq',NULL,NULL,1,NULL,4,NULL),(8,'text','ppppp ppppppp p pp p ppppp',NULL,NULL,3,NULL,4,NULL),(9,'text','last user message test',NULL,NULL,3,1,NULL,NULL),(10,'text','last user message 2222 test',NULL,NULL,4,1,NULL,NULL),(11,'text','axko axko minchev verj!','2014-07-18 02:04:11','2014-07-18 02:04:11',1,3,NULL,NULL),(12,'text','private chat message test 1','2014-07-18 02:04:11','2014-07-18 02:04:11',3,NULL,NULL,1),(13,'text','private chat message test 2','2014-07-18 02:04:11','2014-07-18 02:04:11',1,NULL,NULL,1),(14,'text','private chat message test 3','2014-07-18 02:04:11','2014-07-18 02:04:11',4,NULL,NULL,1);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_events`
--

DROP TABLE IF EXISTS `notification_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vote` int(11) DEFAULT NULL,
  `event_type` varchar(255) DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `from_user_id` int(11) DEFAULT NULL,
  `to_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_events`
--

LOCK TABLES `notification_events` WRITE;
/*!40000 ALTER TABLE `notification_events` DISABLE KEYS */;
INSERT INTO `notification_events` VALUES (29,1,'demote','2014-08-03 14:14:09','2014-08-03 14:14:05','2014-08-03 14:16:18',2,1,5),(30,0,'promote','2014-08-03 14:16:05','2014-08-03 14:15:56','2014-08-03 14:16:05',2,1,5),(31,1,'demote','2014-08-03 14:16:18','2014-08-03 14:16:15','2014-08-03 14:16:18',2,1,5),(32,1,'group_invite','2014-08-05 21:48:06','2014-08-05 21:48:06','2014-08-05 21:48:06',NULL,NULL,NULL),(33,1,'group_invite','2014-08-05 21:52:41','2014-08-05 21:52:41','2014-08-05 21:52:41',NULL,NULL,NULL),(34,1,'group_invite','2014-08-05 22:07:43','2014-08-05 22:07:43','2014-08-05 22:07:43',NULL,NULL,NULL),(35,1,'group_invite','2014-08-05 22:17:14','2014-08-05 22:17:14','2014-08-05 22:17:14',1,1,5),(36,1,'group_invite','2014-08-06 17:01:48','2014-08-06 17:01:48','2014-08-06 17:01:48',1,1,5),(37,1,'group_invite','2014-08-06 17:02:26','2014-08-06 17:02:26','2014-08-06 17:02:26',1,1,5),(38,1,'group_invite','2014-08-06 17:06:17','2014-08-06 17:06:17','2014-08-06 17:06:17',1,1,5),(39,1,'group_invite','2014-08-06 17:09:49','2014-08-06 17:09:49','2014-08-06 17:09:49',1,1,5);
/*!40000 ALTER TABLE `notification_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `private_chat_users`
--

DROP TABLE IF EXISTS `private_chat_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `private_chat_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `chat_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `private_chat_users`
--

LOCK TABLES `private_chat_users` WRITE;
/*!40000 ALTER TABLE `private_chat_users` DISABLE KEYS */;
INSERT INTO `private_chat_users` VALUES (1,'2014-07-18 18:44:12','2014-07-18 18:44:12',1,1),(2,'2014-07-18 18:44:22','2014-07-18 18:44:22',1,3);
/*!40000 ALTER TABLE `private_chat_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `private_chats`
--

DROP TABLE IF EXISTS `private_chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `private_chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `creator_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `private_chats`
--

LOCK TABLES `private_chats` WRITE;
/*!40000 ALTER TABLE `private_chats` DISABLE KEYS */;
INSERT INTO `private_chats` VALUES (1,'2014-07-18 18:43:11','2014-07-18 18:43:11',1),(2,'2014-07-25 19:03:01','2014-07-25 19:03:01',5);
/*!40000 ALTER TABLE `private_chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rating`
--

DROP TABLE IF EXISTS `rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rating` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rate` varchar(255) DEFAULT NULL,
  `rate_title` varchar(255) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rating`
--

LOCK TABLES `rating` WRITE;
/*!40000 ALTER TABLE `rating` DISABLE KEYS */;
INSERT INTO `rating` VALUES (1,'good','Good',NULL,NULL,NULL),(2,'normal','Normal',NULL,NULL,NULL),(3,'bad','Bad',NULL,NULL,NULL);
/*!40000 ALTER TABLE `rating` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spam_reports`
--

DROP TABLE IF EXISTS `spam_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spam_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `message_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spam_reports`
--

LOCK TABLES `spam_reports` WRITE;
/*!40000 ALTER TABLE `spam_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `spam_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_data`
--

DROP TABLE IF EXISTS `user_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `public_full_name` tinyint(1) DEFAULT NULL,
  `public_user_name` tinyint(1) DEFAULT NULL,
  `account_delete_reason` longtext,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_data`
--

LOCK TABLES `user_data` WRITE;
/*!40000 ALTER TABLE `user_data` DISABLE KEYS */;
INSERT INTO `user_data` VALUES (1,'Alex Vanyan','alex@cs16.us','default_avatar.jpg',1,1,NULL,'2014-06-02 01:51:50','2014-06-02 01:51:50',1),(3,'Alex 1','alex1@cs16.us','default_avatar.jpg',1,1,NULL,'2014-06-02 01:51:50','2014-06-02 01:51:50',3),(4,'Alex 2','alex2@cs16.us','default_avatar.jpg',1,1,NULL,'2014-06-02 01:51:50','2014-06-02 01:51:50',4),(5,'Alex 3','alex3@cs16.us','default_avatar.jpg',1,1,NULL,'2014-06-02 01:51:50','2014-06-02 01:51:50',5);
/*!40000 ALTER TABLE `user_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_group_categories`
--

DROP TABLE IF EXISTS `user_group_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_group_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_group_categories`
--

LOCK TABLES `user_group_categories` WRITE;
/*!40000 ALTER TABLE `user_group_categories` DISABLE KEYS */;
INSERT INTO `user_group_categories` VALUES (1,NULL,NULL,1,1,4),(2,NULL,NULL,1,2,4);
/*!40000 ALTER TABLE `user_group_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `is_confirmed` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'alex','$2a$10$aickdFPKbpDFYFz5SQQFn.lOfluNrZKi.FH4Pm4EYFwF.5G/eWkrC',1,1,'2014-06-02 01:51:50','2014-06-02 01:51:50'),(3,'alex1','$2a$10$aickdFPKbpDFYFz5SQQFn.lOfluNrZKi.FH4Pm4EYFwF.5G/eWkrC',1,1,'2014-06-02 01:51:50','2014-06-02 01:51:50'),(4,'alex2','$2a$10$aickdFPKbpDFYFz5SQQFn.lOfluNrZKi.FH4Pm4EYFwF.5G/eWkrC',1,1,'2014-06-02 01:51:50','2014-06-02 01:51:50'),(5,'alex3','$2a$10$aickdFPKbpDFYFz5SQQFn.lOfluNrZKi.FH4Pm4EYFwF.5G/eWkrC',1,1,'2014-06-02 01:51:50','2014-06-02 01:51:50');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-08-06 23:39:23
