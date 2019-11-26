const Hashids = require('hashids/cjs');

const config = require('../configs/app');
const hashids = new Hashids(config.hashidSalt);

module.exports = (sequelize, DataTypes) => {
    const Photo = sequelize.define('photo', {
        filename: DataTypes.STRING,
        thumbnailFilename: DataTypes.STRING,
        mimetype: DataTypes.STRING,
        thumbnailMimetype: DataTypes.STRING,
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
  
    Photo.associate = (models) => {
        models.Photo.belongsTo(models.User, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: true,
            },
        });
        models.Photo.belongsTo(models.Album, {
            onDelete: "SET NULL",
            foreignKey: {
                allowNull: true,
            },
        });
    };

    Photo.prototype.toJSON = function () {
        let values = Object.assign({}, this.get());
      
        values.id = hashids.encode(values.id);
        values.key = values.filename;
        delete values.filename;
        delete values.thumbnailFilename;

        return values;
    };

    return Photo;
};