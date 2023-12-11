const jwt = require('jsonwebtoken')
const bcrypt =  require('bcrypt')




function adminregister(adminData) {
    return new Promise((resolve, reject) => {
        const insertSql = `INSERT INTO admin(username, password, role) 
                           VALUES (?, ?, ?)`;

        const values = [
            adminData.username,
            adminData.password,
            'admin'
        ];

        db.query(insertSql, values, (error, result) => {
            if (error) {
                console.error('Error adding admin:', error);
                reject(error);
            } else {
                const adminId = result.insertId;

                const selectSql = 'SELECT * FROM admintable WHERE id = ?';
                db.query(selectSql, [adminId], (selectError, selectResult) => {
                    if (selectError) {
                        console.error('Error retrieving admin data:', selectError);
                        reject(selectError);
                    } else {
                        const adminData = selectResult[0];
                        resolve(adminData);
                    }
                });
            }
        });
    });
}






function loginadmin(username, password, callback) {
    const query = 'SELECT * FROM admin  WHERE username = ?';
    db.query(query, [username], async (err, results) => {
      if (err) {
        return callback(err, null);
      }
  
      if (results.length === 0) {
        return callback(null, { error: 'Invalid user' });
      }
  
      const user = results[0];
  
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return callback(null, { error: 'Invalid password' });
      }
  
      const secretKey = 'secretkey';
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey);
     console.log('token', token)
      return callback(null, {
        data: {
        
            id: user.id,
            username: user.username,
            password:user.password,
             role : user.role,
            token: token,
        
        }
      });
    });
  }
  
  





  module.exports = {
    adminregister,
    loginadmin
  }