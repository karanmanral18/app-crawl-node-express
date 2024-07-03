
  

  

# App Crawl Node -

  

### Prerequisites :

* [node-js](https://github.com/creationix/nvm) v20
* [npm](https://npmjs.com/)

  

  

  

## Project Setup

  

  

  

```sh
nvm use
```

  

  

```sh
npm install
```

  

## Create .env from .env.example

  

```
# Application Settings
APP_PORT=3000

 
# Database settings
DB_DIALECT=mysql
DB_HOST=localhost
DB_NAME=db_name
DB_USERNAME=db_user_name
DB_PASSWORD=db_password
DB_PORT=3306
DB_DEBUG=true

ELASTICSEARCH_NODE='http://localhost:9200'
ELASTIC_SEARCH_USERNAME='elastic'
ELASTIC_SEARCH_PASSWORD='password'
```

  

### Start crawling and save users to MYSQL and Elasticsearch

  

  

```sh

npm run crawl:clients

  

```

## Elastic Search Record Creation/ Deletion/ Updation

Records on elasic search are automatically created, updated or deleted based on Sequelize AfterCreate , AfterUpdate , AfterDestroy Hooks

  

## API Endpoints

### ( Postman collections are added in the repository)

```

Elastic Search : GET : http://localhost:3000/clients/elastic/search?perPage=10&page=1&id=1&email=xyz&cin=1232423&name=test

Mysql DB Search : GET: http://localhost:3000/clients/?perPage=10&page=1&id=1&email=xyz&cin=1232423&name=test

Create new client : POST :http://localhost:3000/clients

Get Client By Id : GET : http://localhost:3000/clients/1

Update Client : POST : http://localhost:3000/clients/55

Delete Client : DELETE : http://localhost:3000/clients/54
```

  

### Compile and Hot-Reload for Development


```sh
npm run dev
```