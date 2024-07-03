import Sequelize, { Model } from "sequelize";

class Client extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        cin: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          length: 21,
        },
        pin: Sequelize.STRING,
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        freezeTableName: false,
        tableName: 'clients'
      }
    );

    this.addHook("afterDestroy", async (user) => {

    });

    this.addHook("afterUpdate", async (user) => {

    });

    this.addHook("afterCreate", async (user) => {
    });

    return this;
  }
}

export default Client;
