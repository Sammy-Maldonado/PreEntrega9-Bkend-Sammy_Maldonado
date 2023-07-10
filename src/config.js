import dotenv from 'dotenv';
import { Command } from 'commander';

const program = new Command();
program.option('-m, --mode <mode>','Modo de ejecución');
program.parse();

//dotenv.config() SÓLO LEE .env
dotenv.config({
  path: program.opts().mode === "prod" ? './.env.prod' : './.env.dev'
});

export default {
  app: {
    PORT: process.env.PORT || 8080
  },
  mongo: {
    URL: process.env.MONGO_URL || 'localhost:27017'
  },
  admin: {
    EMAIL: process.env.ADMIN_EMAIL,
    PWD: process.env.ADMIN_PWD
  }
}