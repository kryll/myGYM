-- myGYM Database Initialization
CREATE DATABASE IF NOT EXISTS mygym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mygym_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON mygym.* TO 'mygym_user'@'%';
GRANT ALL PRIVILEGES ON mygym_testing.* TO 'mygym_user'@'%';
FLUSH PRIVILEGES;
