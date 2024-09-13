bin := node_modules/.bin

generate-migration:
	ts-node $(bin)/typeorm migration:generate -d packages/database/datasource packages/database/migrations/$(or $(name), rename-me)

migrate:
	ts-node $(bin)/typeorm migration:run -d packages/database/datasource
