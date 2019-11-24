const uuidv4 = require('uuid/v4');

module.exports = (sequelize, DataTypes) => {
    const Token = sequelize.define('token', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        address: DataTypes.STRING,
        active: DataTypes.BOOLEAN,
    }, {
        hooks: {
            beforeCreate: (token) => {
                if (!token.id)
                    token.id = uuidv4();
            },
        },
    });
  
    Token.associate = (models) => {
        models.Token.belongsTo(models.User, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false,
            },
        });
    };

    return Token;
};