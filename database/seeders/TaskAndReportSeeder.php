<?php

namespace Database\Seeders;

use App\Models\Farm;
use App\Models\Farmer;
use App\Models\Task;
use App\Models\TechnicianReport;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskAndReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create technicians
        $technicians = User::whereHas('role', function ($query) {
            $query->where('name', 'technician');
        })->get();

        if ($technicians->count() === 0) {
            $this->command->info('No technicians found. Please run PermissionSeeder and RoleSeeder first.');
            return;
        }

        // Get admin user
        $admin = User::whereHas('role', function ($query) {
            $query->where('name', 'admin');
        })->first();

        if (!$admin) {
            $this->command->info('No admin user found.');
            return;
        }

        $this->command->info('Creating sample tasks and technician reports...');

        // Create sample tasks
        $tasks = $this->createSampleTasks($admin, $technicians);
        
        // Create sample technician reports
        $this->createSampleReports($admin, $technicians, $tasks);

        $this->command->info('Sample tasks and reports created successfully!');
    }

    /**
     * Create sample tasks.
     */
    private function createSampleTasks($admin, $technicians): array
    {
        $taskTemplates = [
            [
                'title' => 'Monitor Rice Crops in Brgy. San Isidro',
                'description' => 'Conduct field monitoring of rice crops to assess growth stage, pest infestation, and overall crop health. Take photos and record observations.',
                'task_type' => 'monitor_crops',
                'target_barangay' => ['San Isidro', 'Santa Cruz'],
                'priority' => 'high',
            ],
            [
                'title' => 'Verify 15 Farmer Applications',
                'description' => 'Verify the farmer applications submitted last week. Check identification documents, farm ownership certificates, and residency proof.',
                'task_type' => 'verify_farmers',
                'target_barangay' => ['Poblacion', 'Mabini'],
                'priority' => 'high',
            ],
            [
                'title' => 'Distribute Fertilizer Allocation Batch #2024-03',
                'description' => 'Distribute fertilizer allocation to eligible farmers in the assigned barangays. Ensure proper documentation and collect acknowledgements.',
                'task_type' => 'distribute_allocation',
                'target_barangay' => ['Rizal', 'Bonifacio'],
                'priority' => 'medium',
            ],
            [
                'title' => 'Register New Farmers in Brgy. Del Pilar',
                'description' => "Conduct farmer registration drive in Brgy. Del Pilar. Collect personal information, farm details, and crop data. Issue LFID numbers.",
                'task_type' => 'register_farmers',
                'target_barangay' => ['Del Pilar'],
                'priority' => 'medium',
            ],
            [
                'title' => 'Assess Crop Damage from Recent Typhoon',
                'description' => 'Assess and document crop damage caused by Typhoon Kristine. Record affected areas, crop types, estimated losses, and take photographic evidence.',
                'task_type' => 'crop_damage_assessment',
                'target_barangay' => ['San Isidro', 'Rizal', 'Mabini'],
                'priority' => 'high',
            ],
            [
                'title' => 'Monitor Corn Fields in Brgy. Aguinaldo',
                'description' => 'Inspect corn fields for pest damage, disease symptoms, and irrigation adequacy. Update monitoring records in the system.',
                'task_type' => 'monitor_crops',
                'target_barangay' => ['Aguinaldo'],
                'priority' => 'low',
            ],
            [
                'title' => 'Verify Vegetable Farmers for Subsidy Program',
                'description' => 'Verify eligibility of vegetable farmers applying for the government subsidy program. Validate farm size, crop type, and income levels.',
                'task_type' => 'verify_farmers',
                'target_barangay' => ['Luna', 'Padilla'],
                'priority' => 'medium',
            ],
            [
                'title' => 'Distribute Rice Seeds to Registered Farmers',
                'description' => 'Distribute high-yield rice seeds to 30 registered farmers. Ensure proper documentation and collect signed acknowledgement receipts.',
                'task_type' => 'distribute_allocation',
                'target_barangay' => ['San Isidro', 'Del Pilar', 'Rizal'],
                'priority' => 'high',
            ],
            [
                'title' => 'Farmer Registration in Remote Barangays',
                'description' => 'Conduct farmer registration in remote barangays: Magallanes and Colon. Coordinate with barangay officials for farmer mobilization.',
                'task_type' => 'register_farmers',
                'target_barangay' => ['Magallanes', 'Colon'],
                'priority' => 'low',
            ],
            [
                'title' => 'Post-Harvest Crop Damage Assessment',
                'description' => 'Assess post-harvest losses due to inadequate storage facilities. Document affected farmers and quantify losses for assistance program.',
                'task_type' => 'crop_damage_assessment',
                'target_barangay' => ['Bonifacio', 'Aguinaldo'],
                'priority' => 'medium',
            ],
        ];

        $tasks = [];
        $now = now();

        foreach ($taskTemplates as $index => $template) {
            $technician = $technicians->random();
            
            // Create variety of statuses
            $statuses = ['pending', 'assigned', 'in_progress', 'submitted', 'verified', 'rejected'];
            $statusWeights = [10, 20, 25, 25, 15, 5]; // Distribution weights
            $status = $this->weightedRandom($statuses, $statusWeights);

            $dueDate = $now->copy()->addDays(rand(1, 30));
            
            // For completed tasks, set past dates
            $completedAt = null;
            $submittedAt = null;
            
            if (in_array($status, ['submitted', 'verified', 'rejected'])) {
                $dueDate = $now->copy()->subDays(rand(1, 10));
                $submittedAt = $dueDate->copy()->addHours(rand(1, 48));
                
                if ($status === 'verified' || $status === 'rejected') {
                    $completedAt = $submittedAt->copy()->addHours(rand(1, 24));
                }
            }

            $task = Task::create([
                'title' => $template['title'],
                'description' => $template['description'],
                'task_type' => $template['task_type'],
                'target_barangay' => $template['target_barangay'],
                'due_date' => $dueDate,
                'assigned_to' => $technician->id,
                'assigned_by' => $admin->id,
                'priority' => $template['priority'],
                'status' => $status,
                'remarks' => in_array($status, ['verified', 'rejected']) 
                    ? ($status === 'verified' ? 'Well executed. All requirements met.' : 'Insufficient documentation. Please resubmit with complete evidence.') 
                    : null,
                'submitted_at' => $submittedAt,
                'completed_at' => $completedAt,
                'created_at' => $now->copy()->subDays(rand(5, 20)),
                'updated_at' => $completedAt ?? $submittedAt ?? $now,
            ]);

            $tasks[] = $task;
        }

        $this->command->info("Created " . count($tasks) . " sample tasks");
        return $tasks;
    }

    /**
     * Create sample technician reports.
     */
    private function createSampleReports($admin, $technicians, $tasks): void
    {
        // Get some sample farmers and farms
        $farmers = Farmer::limit(20)->get();
        $farms = Farm::limit(15)->get();

        $reportTemplates = [
            [
                'report_type' => 'farmer_registration',
                'description' => 'Successfully registered 5 new farmers in Brgy. San Isidro. All documentation completed and LFID numbers issued.',
                'evidence_data' => [
                    'gps' => ['lat' => 6.7230, 'lng' => 125.3580, 'accuracy' => 15],
                    'photos' => ['registration_form_1.jpg', 'registration_form_2.jpg', 'group_photo.jpg'],
                    'signature' => 'technician_signature_1.png',
                    'activity_started_at' => '2024-04-15 08:30:00',
                    'activity_completed_at' => '2024-04-15 12:45:00',
                ],
            ],
            [
                'report_type' => 'farm_creation',
                'description' => 'Mapped and registered 3 new farm parcels in Brgy. Santa Cruz. GPS coordinates recorded and soil samples collected.',
                'evidence_data' => [
                    'gps' => ['lat' => 6.7450, 'lng' => 125.3720, 'accuracy' => 10],
                    'photos' => ['farm_overview.jpg', 'soil_sample.jpg', 'boundary_markers.jpg'],
                    'signature' => 'technician_signature_2.png',
                    'activity_started_at' => '2024-04-14 09:00:00',
                    'activity_completed_at' => '2024-04-14 15:30:00',
                ],
            ],
            [
                'report_type' => 'crop_monitoring',
                'description' => 'Completed crop monitoring for 8 rice fields. Growth stage: tillering. No pest infestation detected. Irrigation adequate.',
                'evidence_data' => [
                    'gps' => ['lat' => 6.7180, 'lng' => 125.3490, 'accuracy' => 12],
                    'photos' => ['rice_field_1.jpg', 'rice_field_2.jpg', 'close_up.jpg', 'irrigation.jpg'],
                    'notes' => 'All fields showing healthy growth. Recommended continued monitoring for pest outbreaks.',
                    'activity_started_at' => '2024-04-13 07:00:00',
                    'activity_completed_at' => '2024-04-13 11:30:00',
                ],
            ],
            [
                'report_type' => 'crop_damage',
                'description' => 'Assessed crop damage from recent flooding in Brgy. Rizal. Estimated 15 hectares affected, primarily rice crops at flowering stage.',
                'evidence_data' => [
                    'gps' => ['lat' => 6.7350, 'lng' => 125.3650, 'accuracy' => 8],
                    'photos' => ['flooded_field_1.jpg', 'flooded_field_2.jpg', 'damaged_crops.jpg', 'water_level.jpg'],
                    'signature' => 'technician_signature_3.png',
                    'notes' => 'Severe flooding caused by heavy rainfall. Farmers requesting emergency assistance.',
                    'activity_started_at' => '2024-04-12 08:00:00',
                    'activity_completed_at' => '2024-04-12 16:00:00',
                ],
            ],
            [
                'report_type' => 'distribution_record',
                'description' => 'Distributed fertilizer to 25 eligible farmers in Brgy. Bonifacio. All acknowledgements collected and documented.',
                'evidence_data' => [
                    'gps' => ['lat' => 6.7280, 'lng' => 125.3540, 'accuracy' => 11],
                    'photos' => ['distribution_site.jpg', 'farmers_receiving.jpg', 'stock_inventory.jpg'],
                    'signature' => 'technician_signature_4.png',
                    'notes' => 'Distribution completed successfully. 2 bags per farmer as per allocation policy.',
                    'activity_started_at' => '2024-04-11 07:30:00',
                    'activity_completed_at' => '2024-04-11 14:00:00',
                ],
            ],
            [
                'report_type' => 'farmer_verification',
                'description' => 'Verified 12 farmer applications in Brgy. Mabini. All documents validated and cross-checked with barangay records.',
                'evidence_data' => [
                    'gps' => ['lat' => 6.7410, 'lng' => 125.3690, 'accuracy' => 13],
                    'photos' => ['verification_process.jpg', 'documents.jpg'],
                    'notes' => '10 applications approved, 2 returned for additional documentation.',
                    'activity_started_at' => '2024-04-10 08:00:00',
                    'activity_completed_at' => '2024-04-10 17:00:00',
                ],
            ],
            [
                'report_type' => 'crop_monitoring',
                'description' => 'Monitored corn fields in Brgy. Aguinaldo. Detected early signs of corn borer infestation in 2 fields. Recommended immediate treatment.',
                'evidence_data' => [
                    'gps' => ['lat' => 6.7520, 'lng' => 125.3780, 'accuracy' => 9],
                    'photos' => ['corn_field.jpg', 'pest_damage.jpg', 'infested_plants.jpg'],
                    'notes' => 'Advised farmers to apply appropriate pesticide. Follow-up inspection scheduled.',
                    'activity_started_at' => '2024-04-09 07:30:00',
                    'activity_completed_at' => '2024-04-09 12:00:00',
                ],
            ],
            [
                'report_type' => 'crop_damage',
                'description' => 'Documented typhoon damage in Brgy. Del Pilar. Strong winds caused lodging in rice fields. Estimated 40% crop loss.',
                'evidence_data' => [
                    'gps' => ['lat' => 6.7150, 'lng' => 125.3420, 'accuracy' => 14],
                    'photos' => ['typhoon_damage_1.jpg', 'typhoon_damage_2.jpg', 'lodged_rice.jpg', 'broken_stems.jpg'],
                    'signature' => 'technician_signature_5.png',
                    'notes' => 'Urgent assistance needed. Farmers requesting replanting support.',
                    'activity_started_at' => '2024-04-08 08:00:00',
                    'activity_completed_at' => '2024-04-08 15:30:00',
                ],
            ],
        ];

        $now = now();
        $reportCount = 0;

        foreach ($reportTemplates as $template) {
            $technician = $technicians->random();
            
            // Create variety of statuses
            $statuses = ['pending', 'submitted', 'verified', 'rejected'];
            $statusWeights = [10, 30, 50, 10];
            $status = $this->weightedRandom($statuses, $statusWeights);

            // Pick a random reference model
            $referenceModel = null;
            $referenceModelType = null;
            $referenceModelId = null;

            if (rand(0, 1) === 0 && $farmers->count() > 0) {
                $referenceModel = $farmers->random();
                $referenceModelType = Farmer::class;
                $referenceModelId = $referenceModel->id;
            } elseif ($farms->count() > 0) {
                $referenceModel = $farms->random();
                $referenceModelType = Farm::class;
                $referenceModelId = $referenceModel->id;
            }

            $createdAt = $now->copy()->subDays(rand(1, 15))->subHours(rand(0, 23));
            $verifiedAt = null;
            $verifiedBy = null;

            if (in_array($status, ['verified', 'rejected'])) {
                $verifiedAt = $createdAt->copy()->addHours(rand(2, 48));
                $verifiedBy = $admin->id;
            }

            TechnicianReport::create([
                'technician_id' => $technician->id,
                'report_type' => $template['report_type'],
                'reference_model_type' => $referenceModelType,
                'reference_model_id' => $referenceModelId,
                'status' => $status,
                'evidence_data' => array_merge($template['evidence_data'], ['notes' => $template['description']]),
                'verified_by' => $verifiedBy,
                'verified_at' => $verifiedAt,
                'rejection_remarks' => $status === 'rejected' ? 'Some photos unclear. Please retake and resubmit.' : null,
                'created_at' => $createdAt,
                'updated_at' => $verifiedAt ?? $createdAt,
            ]);

            $reportCount++;
        }

        // Create some reports linked to tasks
        foreach ($tasks as $task) {
            if (in_array($task->status, ['submitted', 'verified', 'rejected']) && rand(0, 1) === 0) {
                $technician = User::find($task->assigned_to);
                
                $reportTypeMap = [
                    'monitor_crops' => 'crop_monitoring',
                    'verify_farmers' => 'farmer_verification',
                    'distribute_allocation' => 'distribution_record',
                    'register_farmers' => 'farmer_registration',
                    'crop_damage_assessment' => 'crop_damage',
                ];

                $barangayText = implode(', ', $task->target_barangay ?? ['Various']);
                
                TechnicianReport::create([
                    'technician_id' => $technician->id,
                    'report_type' => $reportTypeMap[$task->task_type] ?? 'crop_monitoring',
                    'reference_model_type' => Task::class,
                    'reference_model_id' => $task->id,
                    'status' => $task->status === 'verified' ? 'verified' : ($task->status === 'rejected' ? 'rejected' : 'submitted'),
                    'evidence_data' => [
                        'gps' => [
                            'lat' => 6.7000 + (rand(0, 999) / 10000),
                            'lng' => 125.3000 + (rand(0, 999) / 10000),
                            'accuracy' => rand(5, 20),
                        ],
                        'photos' => [
                            "task_{$task->id}_photo_1.jpg",
                            "task_{$task->id}_photo_2.jpg",
                        ],
                        'signature' => "technician_signature_" . $technician->id . ".png",
                        'activity_started_at' => $task->created_at->format('Y-m-d H:i:s'),
                        'activity_completed_at' => $task->submitted_at?->format('Y-m-d H:i:s') ?? now()->format('Y-m-d H:i:s'),
                        'notes' => "Task completion report: {$task->title}. Target area: {$barangayText}. All activities completed as assigned.",
                    ],
                    'verified_by' => $task->status === 'verified' ? $admin->id : null,
                    'verified_at' => $task->status === 'verified' ? $task->completed_at : null,
                    'rejection_remarks' => $task->status === 'rejected' ? $task->remarks : null,
                    'created_at' => $task->submitted_at ?? $task->created_at,
                    'updated_at' => $task->completed_at ?? $task->updated_at,
                ]);

                $reportCount++;
            }
        }

        $this->command->info("Created {$reportCount} sample technician reports");
    }

    /**
     * Get weighted random value.
     */
    private function weightedRandom(array $values, array $weights)
    {
        $totalWeight = array_sum($weights);
        $random = mt_rand(1, $totalWeight);
        
        $currentWeight = 0;
        foreach ($values as $index => $value) {
            $currentWeight += $weights[$index];
            if ($random <= $currentWeight) {
                return $value;
            }
        }
        
        return $values[0];
    }
}
