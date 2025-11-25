const { selectQuery, User } = require("../../models");
const NotFoundError = require("../../../src/commons/exceptions/NotFoundError");
const AuthenticationError = require("../../../src/commons/exceptions/AuthenticationError");

module.exports = async (uid) => {
    const user = await User.findOne({
        where: {uid : uid},
        attributes: [
            "role_code",
            "email",
            "is_external_user"
        ]
    }); 

    const isExternalUser = user?.dataValues?.is_external_user;
    
    if(isExternalUser == 1){
        const [role] = await selectQuery(`
            SELECT
                role_code
            FROM
                tb_role tr
            WHERE
                is_external_user = 1
                AND CURRENT_TIMESTAMP() NOT BETWEEN start_date AND end_date
                AND deletedAt IS NULL
                AND role_code = :role_code;    
        `, 
        {
            role_code: user?.dataValues?.role_code
        });
      
        if(role){
            throw new AuthenticationError(`Sorry, Role Code ${user?.dataValues?.role_code} is Expired`)
        }

        return true;
    }

    return true;
}