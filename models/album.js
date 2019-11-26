const Hashids = require('hashids/cjs');

const config = require('../configs/app');
const hashids = new Hashids(config.hashidSalt);

module.exports = (sequelize, DataTypes) => {
    const Album = sequelize.define('album', {
        title: DataTypes.STRING,
        private: DataTypes.BOOLEAN,
    }, {
        hooks: {
            beforeSave: (photo) => {
                if (!photo.private)
                    photo.private = true;
            },
        },
    });
  
    Album.associate = (models) => {
        models.Album.belongsTo(models.User, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: true,
            },
        });
        models.Album.hasMany(models.Photo);
    };

    Album.prototype.toJSON = function () {
        let values = Object.assign({}, this.get());
        values.id = hashids.encode(values.id);
        return values;
    };

    return Album;
};