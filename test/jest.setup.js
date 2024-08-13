import fs from 'fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

process.env.PAYLOAD_DISABLE_ADMIN = 'true'
process.env.PAYLOAD_DROP_DATABASE = 'true'

process.env.PAYLOAD_PUBLIC_CLOUD_STORAGE_ADAPTER = 's3'

process.env.NODE_OPTIONS = '--no-deprecation'

const databaseAdapters = {
  mongodb: `
  import { mongooseAdapter } from '@payloadcms/db-mongodb'

  export const databaseAdapter = mongooseAdapter({
    url:
      process.env.MONGODB_MEMORY_SERVER_URI ||
      process.env.DATABASE_URI ||
      'mongodb://127.0.0.1/payloadtests',
    collation: {
      strength: 1,
    },
  })`,
  postgres: `
  import { postgresAdapter } from '@payloadcms/db-postgres'

  export const databaseAdapter = postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || 'postgres://127.0.0.1:5432/payloadtests',
    },
  })`,
  'postgres-custom-schema': `
  import { postgresAdapter } from '@payloadcms/db-postgres'

  export const databaseAdapter = postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || 'postgres://127.0.0.1:5432/payloadtests',
    },
    schemaName: 'custom',
  })`,
  'postgres-uuid': `
    import { postgresAdapter } from '@payloadcms/db-postgres'

  export const databaseAdapter = postgresAdapter({
    idType: 'uuid',
    pool: {
      connectionString: process.env.POSTGRES_URL || 'postgres://127.0.0.1:5432/payloadtests',
    },
  })`,
  sqlite: `
  import { sqliteAdapter } from '@payloadcms/db-sqlite'

  export const databaseAdapter = sqliteAdapter({
    client: {
      url: process.env.SQLITE_URL || 'file:./payloadtests.db',
    },
  })`,
  supabase: `
  import { postgresAdapter } from '@payloadcms/db-postgres'

  export const databaseAdapter = postgresAdapter({
    pool: {
      connectionString:
        process.env.POSTGRES_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    },
  })`,
}
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const dbAdapter = process.env.PAYLOAD_DATABASE || 'mongodb'

// Generate databaseAdapter.ts
const databaseAdapter = databaseAdapters[dbAdapter]

// Write to databaseAdapter.ts
fs.writeFileSync(
  path.resolve(dirname, 'databaseAdapter.ts'),
  `
  // DO NOT MODIFY. This file is automatically generated in initDevAndTest.ts

  ${databaseAdapter}
  `,
)

console.log('Wrote', dbAdapter, 'db adapter')
