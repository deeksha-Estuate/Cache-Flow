# Migrations

Migrate products or subscriptions using the Flow API. Products can be migrated from an existing organization or from CSV. Subscriptions can be migrated using a CSV.

## Install dependencies

```
yarn install
```

## Configure environment api token (can rename `environments.json.example` to `environments.json`)

```
{
   "cacheflow:prod": "prod_api_token",
   "cacheflow:dev": "dev_api_token",
   "cacheflow:local": "local_api_token",
   "getcacheflow:local": "local_api_token",
}
```

## Migrating subscriptions with a customer:environment and subscriptions file

```
yarn compile-subscriptions
```

```
yarn migrate-subscriptions cacheflow:local data/cacheflow-subscriptions.csv
```

Alternatively, tee the output to a file:

```
yarn migrate cacheflow:local data/cacheflow-subscriptions.csv | tee logs/$(date +%Y%m%dT%H%M%S).log
```

## Migrating products with a customer:environment and products file

```
yarn compile-products
```

```
yarn dump-products cacheflow:local data/cacheflow-local-products.json
```

```
yarn migrate-products cacheflow:dev data/cacheflow-local-products.json
```

Alternatively, tee the output to a file:

```
yarn migrate cacheflow:local data/cacheflow-products.json | tee logs/$(date +%Y%m%dT%H%M%S).log
```

## Purging products with a customer:environment

```
yarn compile-products
```

```
yarn purge-products cacheflow:local
```

Alternatively, tee the output to a file:

```
yarn purge-products cacheflow:local | tee logs/$(date +%Y%m%dT%H%M%S).log
```

## Migrating contacts with a customer:environment

```
yarn compile-contacts
```

```
yarn migrate-contacts estuate:sandbox data/estuate-contacts.csv;