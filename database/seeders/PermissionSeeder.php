<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Farmers Module
            ['name' => 'farmers.view', 'display_name' => 'View Farmers', 'description' => 'Can view farmer records', 'module' => 'farmers'],
            ['name' => 'farmers.create', 'display_name' => 'Create Farmers', 'description' => 'Can create new farmer records', 'module' => 'farmers'],
            ['name' => 'farmers.update', 'display_name' => 'Update Farmers', 'description' => 'Can update farmer records', 'module' => 'farmers'],
            ['name' => 'farmers.delete', 'display_name' => 'Delete Farmers', 'description' => 'Can delete farmer records', 'module' => 'farmers'],

            // Farms Module
            ['name' => 'farms.view', 'display_name' => 'View Farms', 'description' => 'Can view farm records', 'module' => 'farms'],
            ['name' => 'farms.create', 'display_name' => 'Create Farms', 'description' => 'Can create new farm records', 'module' => 'farms'],
            ['name' => 'farms.update', 'display_name' => 'Update Farms', 'description' => 'Can update farm records', 'module' => 'farms'],
            ['name' => 'farms.delete', 'display_name' => 'Delete Farms', 'description' => 'Can delete farm records', 'module' => 'farms'],

            // Crop Monitoring Module
            ['name' => 'crop_monitoring.view', 'display_name' => 'View Crop Monitoring', 'description' => 'Can view crop monitoring data', 'module' => 'crop_monitoring'],
            ['name' => 'crop_monitoring.create', 'display_name' => 'Create Crop Monitoring', 'description' => 'Can create crop monitoring entries', 'module' => 'crop_monitoring'],
            ['name' => 'crop_monitoring.update', 'display_name' => 'Update Crop Monitoring', 'description' => 'Can update crop monitoring entries', 'module' => 'crop_monitoring'],
            ['name' => 'crop_monitoring.verify', 'display_name' => 'Verify Crop Monitoring', 'description' => 'Can verify crop monitoring submissions', 'module' => 'crop_monitoring'],

            // Crop Damage Module
            ['name' => 'crop_damage.view', 'display_name' => 'View Crop Damage', 'description' => 'Can view crop damage reports', 'module' => 'crop_damage'],
            ['name' => 'crop_damage.create', 'display_name' => 'Create Crop Damage', 'description' => 'Can create crop damage reports', 'module' => 'crop_damage'],
            ['name' => 'crop_damage.update', 'display_name' => 'Update Crop Damage', 'description' => 'Can update crop damage reports', 'module' => 'crop_damage'],
            ['name' => 'crop_damage.verify', 'display_name' => 'Verify Crop Damage', 'description' => 'Can verify crop damage reports', 'module' => 'crop_damage'],

            // Distribution Module
            ['name' => 'distribution.view', 'display_name' => 'View Distribution', 'description' => 'Can view distribution records', 'module' => 'distribution'],
            ['name' => 'distribution.create', 'display_name' => 'Create Distribution', 'description' => 'Can create distribution records', 'module' => 'distribution'],
            ['name' => 'distribution.update', 'display_name' => 'Update Distribution', 'description' => 'Can update distribution records', 'module' => 'distribution'],
            ['name' => 'distribution.verify', 'display_name' => 'Verify Distribution', 'description' => 'Can verify distribution records', 'module' => 'distribution'],

            // Tasks Module
            ['name' => 'tasks.view', 'display_name' => 'View Tasks', 'description' => 'Can view tasks', 'module' => 'tasks'],
            ['name' => 'tasks.create', 'display_name' => 'Create Tasks', 'description' => 'Can create tasks', 'module' => 'tasks'],
            ['name' => 'tasks.assign', 'display_name' => 'Assign Tasks', 'description' => 'Can assign tasks to technicians', 'module' => 'tasks'],
            ['name' => 'tasks.update', 'display_name' => 'Update Tasks', 'description' => 'Can update tasks', 'module' => 'tasks'],
            ['name' => 'tasks.verify', 'display_name' => 'Verify Tasks', 'description' => 'Can verify completed tasks', 'module' => 'tasks'],

            // Reports Module
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'description' => 'Can view technician reports', 'module' => 'reports'],
            ['name' => 'reports.verify', 'display_name' => 'Verify Reports', 'description' => 'Can verify technician reports', 'module' => 'reports'],
            ['name' => 'reports.reject', 'display_name' => 'Reject Reports', 'description' => 'Can reject technician reports', 'module' => 'reports'],

            // DSS Module
            ['name' => 'dss.run', 'display_name' => 'Run DSS', 'description' => 'Can run decision support system', 'module' => 'dss'],
            ['name' => 'dss.view_results', 'display_name' => 'View DSS Results', 'description' => 'Can view DSS results', 'module' => 'dss'],

            // Allocations Module
            ['name' => 'allocations.view', 'display_name' => 'View Allocations', 'description' => 'Can view allocation data', 'module' => 'allocations'],
            ['name' => 'allocations.create', 'display_name' => 'Create Allocations', 'description' => 'Can create allocations', 'module' => 'allocations'],
            ['name' => 'allocations.verify', 'display_name' => 'Verify Allocations', 'description' => 'Can verify allocations', 'module' => 'allocations'],

            // User Management Module
            ['name' => 'users.view', 'display_name' => 'View Users', 'description' => 'Can view user accounts', 'module' => 'users'],
            ['name' => 'users.create', 'display_name' => 'Create Users', 'description' => 'Can create user accounts', 'module' => 'users'],
            ['name' => 'users.update', 'display_name' => 'Update Users', 'description' => 'Can update user accounts', 'module' => 'users'],
            ['name' => 'users.delete', 'display_name' => 'Delete Users', 'description' => 'Can delete user accounts', 'module' => 'users'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }
    }
}
