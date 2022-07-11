-- MySQL dump 10.13  Distrib 8.0.21, for Win64 (x86_64)
--
-- Host: localhost    Database: skyzhoutop
-- ------------------------------------------------------
-- Server version	8.0.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chat`
--

DROP TABLE IF EXISTS `chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat` (
  `History` mediumtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat`
--

LOCK TABLES `chat` WRITE;
/*!40000 ALTER TABLE `chat` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filename`
--

DROP TABLE IF EXISTS `filename`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filename` (
  `File` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filename`
--

LOCK TABLES `filename` WRITE;
/*!40000 ALTER TABLE `filename` DISABLE KEYS */;
INSERT INTO `filename` VALUES ('Zelda.jpg'),('Ghelper_2.5.5.zip'),('68FE2C156C31A5AF82E41F2DBBAC0156.jpg'),('websocket.html'),('chrome.exe'),('upgrade.exe'),('richardmilos.Mp4'),('dc54564e9258d109312c8bf4dd58ccbf6d814dac.png'),('Peach.webp'),('furry.jpg'),('furry2.jpg'),('1.PNG'),('Peach.jpg'),('Kano.jpg'),('Skyzhou.top.jpg'),('python-2.7.18.amd64.msi'),('2.pdf'),('examtest.cpp'),('20210617.mp4'),('logic.cpp'),('sjm.mp4'),('sjm.mp4'),('sjm2.mp4'),('444.html'),('444.html'),('114514.txt'),('answers_of_IT_test.docx'),('403338903.txt');
/*!40000 ALTER TABLE `filename` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rank2048`
--

DROP TABLE IF EXISTS `rank2048`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rank2048` (
  `Username` varchar(100) DEFAULT NULL,
  `Score` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rank2048`
--

LOCK TABLES `rank2048` WRITE;
/*!40000 ALTER TABLE `rank2048` DISABLE KEYS */;
INSERT INTO `rank2048` VALUES ('Skyzhou',31284),('YuckXi',8187),('test',1488),('Server',1688),('None',2572),('zhm',5360),('YuanXunGeJi',5232),('tt66ea',8188),('2147483647',2376);
/*!40000 ALTER TABLE `rank2048` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `top`
--

DROP TABLE IF EXISTS `top`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `top` (
  `Username` varchar(100) NOT NULL,
  `Password` varchar(100) DEFAULT NULL,
  `Level` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `top`
--

LOCK TABLES `top` WRITE;
/*!40000 ALTER TABLE `top` DISABLE KEYS */;
INSERT INTO `top` VALUES ('-MILOSH-','xj258258','<img src=\"http://skyzhou.top:8026/crown.png\" id = \"king-png\">'),('0938','zwdzwdzwd','User'),('123lll','123lll','User'),('1919810','lcwhka','YeShi'),('2147483647','2147483647','离谱'),('2911295052@qq.com','20180923czt','User'),('asdf','asdf','User'),('å»æ.','1360821000dqm','User'),('ååååæ','180927','User'),('Crazymartian','19760909','User'),('CZX','123456','User'),('çCZT','20180923CZT','User'),('Deefed Pierce','SkyzhouSb','User'),('Evan704','Evan704orzMYH','User'),('fast','123456','User'),('hanseryousa','123456789','ProDD'),('hrtttttt','qazplm11','User'),('hrttttttttt','qazplm11','User'),('luna yyds','180927','User'),('ly','111','User'),('lzh','0913hang','User'),('None','None','User'),('OYPKloveDL','20060110','User'),('PM','123456','User'),('Rosmontis','Rosmontis','User'),('Server','skysky','User'),('ShuraEye','syjbjsby43hc','User'),('Skyzhou','skysky','SuperAdmin'),('superflash','superflash','飞侠'),('test','test','testuser'),('The Cleaner of Ye Company','123456','User'),('tt66ea','1w3r5y7i9','User'),('tylon2006','tylon200619','User'),('VictorYep','VictorYip','超级至尊'),('w','0000','User'),('WangXin','skyzhouzibenzhuyi','XJ'),('wdh','19260817','User'),('wentox','wentox','User'),('xwå¸¦ä½ å»ç¬å±±','GDGZJSBY43HC','User'),('youyugua','yyf52065','User'),('YuanXunGeJi','atdsbui$&$46','<img src=\"http://skyzhou.top:8026/sjm.jpg\" style=\"height: 20px;width: 20px;vertical-align: middle;\">'),('Yuckxi','yuckxinb','Admin'),('Zbro','zbro0918','User'),('zhm','2017gdgzoi768','User'),('zhy07','qwerty','User'),('zwd','zzh050912','User'),('zyx','180945','User');
/*!40000 ALTER TABLE `top` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-02-07 16:21:50
