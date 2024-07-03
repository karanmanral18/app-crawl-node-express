import Sequelize, { Model } from "sequelize";
import elasticSearchService from "../services/elastic-search.service.js";

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

    this.addHook("afterCreate", async (user) => {
      await elasticSearchService.create(user);
    });

    this.addHook("afterUpdate", async (user) => {
      await elasticSearchService.update(user);
    });

    return this;
  }
}

export default Client;
