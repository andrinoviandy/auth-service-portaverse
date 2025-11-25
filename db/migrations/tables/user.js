// corporate_id int NOT NULL,
module.exports = (corporate_id) => `
    CREATE TABLE tb_user_${corporate_id} (
        user_id int NOT NULL AUTO_INCREMENT,
        uid varchar(50) NOT NULL,
        role_code varchar(4) NOT NULL,
        email varchar(50) NOT NULL,
        phone_number varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
        last_login timestamp NULL DEFAULT NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deletedAt timestamp NULL DEFAULT NULL,
        PRIMARY KEY (user_id)
    );
`;
