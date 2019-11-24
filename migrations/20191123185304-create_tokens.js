module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('tokens', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING
            },
            address: {
                allowNull: false,
                type: Sequelize.STRING
            },
            active: {
                allowNull: false,
                defaultValue: true,
                type: Sequelize.BOOLEAN,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            userId: {
                type: Sequelize.INTEGER,
                onDelete: "CASCADE",
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            }
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('tokens');
    }
};
