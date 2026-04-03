<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farmer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SyncController extends Controller
{
    /**
     * Process queued operations from offline clients
     */
    public function sync(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'operations' => 'required|array',
            'operations.*.operation_id' => 'required|string|unique:sync_logs,operation_id',
            'operations.*.action_type' => 'required|in:create,update,delete',
            'operations.*.entity_type' => 'required|in:farmer,farm,farm_parcel,crop_damage,allocation',
            'operations.*.payload' => 'required|array',
            'operations.*.timestamp' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid sync request',
                'errors' => $validator->errors()
            ], 422);
        }

        $operations = $request->input('operations');
        $results = [
            'success' => true,
            'synced_count' => 0,
            'failed_count' => 0,
            'conflicts' => []
        ];

        DB::beginTransaction();

        try {
            foreach ($operations as $operation) {
                $operationResult = $this->processOperation($operation);
                
                if ($operationResult['success']) {
                    $results['synced_count']++;
                    
                    // Log successful sync for idempotency
                    $this->logSyncOperation($operation);
                } else {
                    $results['failed_count']++;
                    $results['conflicts'][] = [
                        'operation_id' => $operation['operation_id'],
                        'error' => $operationResult['error'],
                        'entity_type' => $operation['entity_type'],
                        'action_type' => $operation['action_type']
                    ];
                }
            }

            DB::commit();

            return response()->json($results);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process a single operation
     */
    private function processOperation(array $operation): array
    {
        $entityType = $operation['entity_type'];
        $actionType = $operation['action_type'];
        $payload = $operation['payload'];

        try {
            switch ($entityType) {
                case 'farmer':
                    return $this->processFarmerOperation($actionType, $payload);
                
                case 'farm':
                    return $this->processFarmOperation($actionType, $payload);
                
                default:
                    return [
                        'success' => false,
                        'error' => "Unsupported entity type: {$entityType}"
                    ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Process farmer operation
     */
    private function processFarmerOperation(string $actionType, array $payload): array
    {
        try {
            switch ($actionType) {
                case 'create':
                    return $this->createFarmer($payload);
                
                case 'update':
                    return $this->updateFarmer($payload);
                
                case 'delete':
                    return $this->deleteFarmer($payload);
                
                default:
                    return [
                        'success' => false,
                        'error' => "Invalid action type: {$actionType}"
                    ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create farmer with validation
     */
    private function createFarmer(array $payload): array
    {
        // Check for duplicate LFID if provided
        if (isset($payload['lfid'])) {
            $existing = Farmer::where('lfid', $payload['lfid'])->first();
            
            if ($existing) {
                return [
                    'success' => false,
                    'error' => 'Duplicate LFID: ' . $payload['lfid']
                ];
            }
        }

        // Validate required fields
        $requiredFields = ['first_name', 'last_name', 'sex'];
        foreach ($requiredFields as $field) {
            if (empty($payload[$field])) {
                return [
                    'success' => false,
                    'error' => "Missing required field: {$field}"
                ];
            }
        }

        // Create farmer
        $farmer = Farmer::create($payload);

        return [
            'success' => true,
            'data' => $farmer->fresh()
        ];
    }

    /**
     * Update farmer with conflict detection
     */
    private function updateFarmer(array $payload): array
    {
        if (!isset($payload['id'])) {
            return [
                'success' => false,
                'error' => 'Missing farmer ID'
            ];
        }

        $farmer = Farmer::find($payload['id']);
        
        if (!$farmer) {
            return [
                'success' => false,
                'error' => 'Farmer not found'
            ];
        }

        // Check for LFID conflicts
        if (isset($payload['lfid']) && $payload['lfid'] !== $farmer->lfid) {
            $existing = Farmer::where('lfid', $payload['lfid'])
                ->where('id', '!=', $farmer->id)
                ->first();
            
            if ($existing) {
                return [
                    'success' => false,
                    'error' => 'LFID already in use: ' . $payload['lfid']
                ];
            }
        }

        // Validate registration_status transitions if being updated
        if (isset($payload['registration_status'])) {
            $validTransitions = $this->getValidStatusTransitions();
            
            if ($farmer->registration_status && 
                isset($validTransitions[$farmer->registration_status]) &&
                !in_array($payload['registration_status'], $validTransitions[$farmer->registration_status])
            ) {
                return [
                    'success' => false,
                    'error' => 'Invalid registration status transition'
                ];
            }
        }

        // Update farmer
        $farmer->update($payload);

        return [
            'success' => true,
            'data' => $farmer->fresh()
        ];
    }

    /**
     * Delete farmer
     */
    private function deleteFarmer(array $payload): array
    {
        if (!isset($payload['id'])) {
            return [
                'success' => false,
                'error' => 'Missing farmer ID'
            ];
        }

        $farmer = Farmer::find($payload['id']);
        
        if (!$farmer) {
            return [
                'success' => false,
                'error' => 'Farmer not found'
            ];
        }

        $farmer->delete();

        return [
            'success' => true
        ];
    }

    /**
     * Process farm operation
     */
    private function processFarmOperation(string $actionType, array $payload): array
    {
        // TODO: Implement farm operations
        return [
            'success' => false,
            'error' => 'Farm operations not yet implemented'
        ];
    }

    /**
     * Get valid registration status transitions
     */
    private function getValidStatusTransitions(): array
    {
        return [
            'not_registered' => ['for_submission'],
            'for_submission' => ['submitted_to_da', 'rejected'],
            'submitted_to_da' => ['verified', 'rejected'],
            'rejected' => ['for_submission'],
            'verified' => []
        ];
    }

    /**
     * Log sync operation for idempotency
     */
    private function logSyncOperation(array $operation): void
    {
        DB::table('sync_logs')->insert([
            'operation_id' => $operation['operation_id'],
            'entity_type' => $operation['entity_type'],
            'action_type' => $operation['action_type'],
            'payload' => json_encode($operation['payload']),
            'timestamp' => $operation['timestamp'],
            'synced_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
