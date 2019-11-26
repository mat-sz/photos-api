const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        superuser: DataTypes.BOOLEAN,
    }, {
        hooks: {
            beforeSave: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 12);
                }
            }
        },
    });
    
    User.prototype.comparePassword = (password) => {
        return bcrypt.compare(password, this.password);
    };

    User.prototype.toJSON = () => {
        let values = Object.assign({}, this.get());
      
        delete values.password;
        return values;
    };

    User.associate = (models) => {
        models.User.hasMany(models.Photo);
        models.User.hasMany(models.Token);
    };
  
    return User;
};