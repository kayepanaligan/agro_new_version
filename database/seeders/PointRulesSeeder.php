<?php

namespace Database\Seeders;

use App\Models\PointRule;
use Illuminate\Database\Seeder;

class PointRulesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rules = [
            [
                'name' => 'Daily Login',
                'trigger_action' => 'login',
                'points_awarded' => 5,
                'max_earnable' => 1,
                'description' => 'Login to the app daily',
                'is_active' => true,
            ],
            [
                'name' => '7-Day Login Streak',
                'trigger_action' => 'login_streak_7',
                'points_awarded' => 50,
                'max_earnable' => null,
                'description' => 'Maintain 7 consecutive daily logins',
                'is_active' => true,
            ],
            [
                'name' => 'Form Submission',
                'trigger_action' => 'form_submit',
                'points_awarded' => 30,
                'max_earnable' => null,
                'description' => 'Submit a form or report',
                'is_active' => true,
            ],
            [
                'name' => 'Profile Completion',
                'trigger_action' => 'profile_complete',
                'points_awarded' => 100,
                'max_earnable' => 1,
                'description' => 'Complete your profile to 100%',
                'is_active' => true,
            ],
            [
                'name' => 'Photo Upload',
                'trigger_action' => 'photo_upload',
                'points_awarded' => 20,
                'max_earnable' => null,
                'description' => 'Upload farm photos',
                'is_active' => true,
            ],
            [
                'name' => 'Survey Completion',
                'trigger_action' => 'survey_complete',
                'points_awarded' => 80,
                'max_earnable' => null,
                'description' => 'Complete a survey',
                'is_active' => true,
            ],
            [
                'name' => 'Attendance Confirmation',
                'trigger_action' => 'attendance_confirm',
                'points_awarded' => 15,
                'max_earnable' => null,
                'description' => 'Confirm attendance at events or trainings',
                'is_active' => true,
            ],
            [
                'name' => 'Crop Damage Report',
                'trigger_action' => 'crop_damage_report',
                'points_awarded' => 40,
                'max_earnable' => null,
                'description' => 'Submit a crop damage report',
                'is_active' => true,
            ],
        ];

        foreach ($rules as $rule) {
            PointRule::create($rule);
        }
    }
}
