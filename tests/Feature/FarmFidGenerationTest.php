<?php

namespace Tests\Feature;

use App\Models\Farm;
use App\Models\FarmParcel;
use App\Models\Farmer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FarmFidGenerationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_generates_fid_for_farm()
    {
        // Create a farmer with LFID
        $farmer = Farmer::factory()->create([
            'lfid' => 'DCAG-26-ZN1-0001',
        ]);

        // Create a farm for this farmer
        $farm = Farm::create([
            'farmer_id' => $farmer->id,
            'farm_name' => 'Test Farm 1',
        ]);

        // Assert FID was generated
        $this->assertNotNull($farm->fid);
        $this->assertEquals('DCAG-26-ZN1-0001-FO1', $farm->fid);
    }

    /** @test */
    public function it_generates_sequential_fid_for_multiple_farms()
    {
        // Create a farmer with LFID
        $farmer = Farmer::factory()->create([
            'lfid' => 'DCAG-26-ZN1-0001',
        ]);

        // Create multiple farms for this farmer
        $farm1 = Farm::create([
            'farmer_id' => $farmer->id,
            'farm_name' => 'Test Farm 1',
        ]);

        $farm2 = Farm::create([
            'farmer_id' => $farmer->id,
            'farm_name' => 'Test Farm 2',
        ]);

        $farm3 = Farm::create([
            'farmer_id' => $farmer->id,
            'farm_name' => 'Test Farm 3',
        ]);

        // Assert sequential FIDs were generated
        $this->assertEquals('DCAG-26-ZN1-0001-FO1', $farm1->fid);
        $this->assertEquals('DCAG-26-ZN1-0001-FO2', $farm2->fid);
        $this->assertEquals('DCAG-26-ZN1-0001-FO3', $farm3->fid);
    }

    /** @test */
    public function it_generates_fpid_for_farm_parcel()
    {
        // Create a farmer with LFID
        $farmer = Farmer::factory()->create([
            'lfid' => 'DCAG-26-ZN1-0001',
        ]);

        // Create a farm for this farmer
        $farm = Farm::create([
            'farmer_id' => $farmer->id,
            'farm_name' => 'Test Farm 1',
        ]);

        // Create a farm parcel for this farm
        $parcel = FarmParcel::create([
            'farm_id' => $farm->id,
            'parcel_number' => 'P001',
            'barangay' => 'Test Barangay',
            'city_municipality' => 'Test City',
            'total_farm_area' => 100.50,
        ]);

        // Assert FPID was generated
        $this->assertNotNull($parcel->fpid);
        $this->assertEquals('DCAG-26-ZN1-0001-FO1-PO1', $parcel->fpid);
    }

    /** @test */
    public function it_generates_sequential_fpid_for_multiple_parcels()
    {
        // Create a farmer with LFID
        $farmer = Farmer::factory()->create([
            'lfid' => 'DCAG-26-ZN1-0001',
        ]);

        // Create a farm for this farmer
        $farm = Farm::create([
            'farmer_id' => $farmer->id,
            'farm_name' => 'Test Farm 1',
        ]);

        // Create multiple parcels for this farm
        $parcel1 = FarmParcel::create([
            'farm_id' => $farm->id,
            'parcel_number' => 'P001',
            'barangay' => 'Test Barangay',
            'city_municipality' => 'Test City',
            'total_farm_area' => 100.50,
        ]);

        $parcel2 = FarmParcel::create([
            'farm_id' => $farm->id,
            'parcel_number' => 'P002',
            'barangay' => 'Test Barangay',
            'city_municipality' => 'Test City',
            'total_farm_area' => 200.75,
        ]);

        $parcel3 = FarmParcel::create([
            'farm_id' => $farm->id,
            'parcel_number' => 'P003',
            'barangay' => 'Test Barangay',
            'city_municipality' => 'Test City',
            'total_farm_area' => 150.25,
        ]);

        // Assert sequential FPIDs were generated
        $this->assertEquals('DCAG-26-ZN1-0001-FO1-PO1', $parcel1->fpid);
        $this->assertEquals('DCAG-26-ZN1-0001-FO1-PO2', $parcel2->fpid);
        $this->assertEquals('DCAG-26-ZN1-0001-FO1-PO3', $parcel3->fpid);
    }

    /** @test */
    public function it_generates_correct_fpid_across_different_farms()
    {
        // Create a farmer with LFID
        $farmer = Farmer::factory()->create([
            'lfid' => 'DCAG-26-ZN1-0001',
        ]);

        // Create two farms for this farmer
        $farm1 = Farm::create([
            'farmer_id' => $farmer->id,
            'farm_name' => 'Test Farm 1',
        ]);

        $farm2 = Farm::create([
            'farmer_id' => $farmer->id,
            'farm_name' => 'Test Farm 2',
        ]);

        // Create parcels for each farm
        $parcel1_farm1 = FarmParcel::create([
            'farm_id' => $farm1->id,
            'parcel_number' => 'P001',
            'barangay' => 'Test Barangay',
            'city_municipality' => 'Test City',
            'total_farm_area' => 100.50,
        ]);

        $parcel1_farm2 = FarmParcel::create([
            'farm_id' => $farm2->id,
            'parcel_number' => 'P001',
            'barangay' => 'Test Barangay',
            'city_municipality' => 'Test City',
            'total_farm_area' => 200.75,
        ]);

        // Assert correct FPIDs with different farm numbers
        $this->assertEquals('DCAG-26-ZN1-0001-FO1-PO1', $parcel1_farm1->fpid);
        $this->assertEquals('DCAG-26-ZN1-0001-FO2-PO1', $parcel1_farm2->fpid);
    }
}
