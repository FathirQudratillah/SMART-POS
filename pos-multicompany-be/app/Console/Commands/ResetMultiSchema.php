<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Throwable;

class ResetMultiSchema extends Command
{
    protected $signature = 'db:reset-multischema
                            {--seed : Run database seeders after migration}
                            {--force : Skip confirmation}';

    protected $description = 'Reset PostgreSQL custom schemas and run fresh migrations';

    public function handle(): int
    {
        // Hindari reset database production.
        if (app()->environment('production')) {
            $this->error('This command cannot run in production.');

            return self::FAILURE;
        }

        if (DB::connection()->getDriverName() !== 'pgsql') {
            $this->error('This command only supports PostgreSQL.');

            return self::FAILURE;
        }

        $schemas = config('multischema.schemas', []);

        if (empty($schemas)) {
            $this->error('No custom schemas configured.');

            return self::FAILURE;
        }

        if (!$this->option('force')) {
            if (!$this->confirm(
                'This will permanently delete database data. Continue?'
            )) {
                $this->info('Reset cancelled.');

                return self::SUCCESS;
            }
        }

        try {
            $connection = DB::connection();

            $this->info('Resetting custom schemas...');

            foreach ($schemas as $schema) {
                // Validasi nama schema agar aman digunakan sebagai identifier.
                if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $schema)) {
                    throw new \InvalidArgumentException(
                        "Invalid schema name: {$schema}"
                    );
                }

                $quotedSchema = '"' . $schema . '"';

                $this->line("Dropping schema: {$schema}");

                $connection->statement(
                    "DROP SCHEMA IF EXISTS {$quotedSchema} CASCADE"
                );

                $this->line("Creating schema: {$schema}");

                $connection->statement(
                    "CREATE SCHEMA {$quotedSchema}"
                );
            }

            $this->newLine();
            $this->info('Running fresh migrations...');

            $arguments = [
                '--force' => true,
            ];

            if ($this->option('seed')) {
                $arguments['--seed'] = true;
            }

            $exitCode = Artisan::call('migrate:fresh', $arguments);

            $this->output->write(Artisan::output());

            if ($exitCode !== 0) {
                $this->error('Migration failed.');

                return self::FAILURE;
            }

            $this->newLine();
            $this->info('Database reset completed successfully.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Database reset failed.');
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
