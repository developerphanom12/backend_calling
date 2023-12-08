module.exports = {
    COMMON: {
        INVALID_ID: {
            message: "Invalid id",
            status: 400
        }
    },

    USER_API: {  
        USER_CREATE: {
            message: "Telecaller CREATE SUCCESSFULLY",
            status: 201
        },
    

        USER_NOT_CREATE: {
            message: "Telecaller CREATE SUCCESSFULLY",
            status: 201
        },

        USER_LOGIN_SUCCESS: {
            message: " Telecaller LOGIN SUCCESSFULLY",
            status: 200
        },

        
        USER_LOGIN_ERROR: {
            message: " ERRO WHILE LOGIN",
            status: 401
        },


         
        USER_ERROR: {
            message: " SOMETHING RONG",
            status: 401
        },
  
        USER_PASSWORD_CHANGE: {
            message: " Telecaller PASSWORD CHANGE SUCCESSFULLY",
            status: 401
        },
       
    
        USER_UPDATE: {
            message: " Telecaller UPDATE SUCCESSFULLY",
            status: 200
        },

        USER_FETCH: {
            message: " Telecaller FETCH SUCCESSFULLY",
            status: 200
        },

        USER_ALREADY_REGISTER: {
            message: "Telecaller ALREADY REGISTER",
            status: 400
        },
        USER_NOT_FOUND: {
            message: " Telecaller NOT FOUND",
            status: 404
        },
        USER_UNAUTHORIZED: {
            message: " Telecaller UNAUTHORIZED",
            status: 401
        },
        FILE_TYPE_INVALID: {
            MESSAGE: "INVALID FILE TYPE",
            status: 400
        },
        PLEASE_CHECK: {
            message: "check your id you have to pass",
            status: 401
        },
        USER_PHOTO: {
            message: "Telecaller profile photo upload succesfully",
            status: 201
        },
        USER_ERROR_PHOTO: {
            message: "error while upload photo",
            status: 401
        },


    }
}