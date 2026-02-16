<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'city',
        'type',
        'coordinates',
        'fare_multiplier',
        'description',
        'is_active',
    ];

    protected $casts = [
        'coordinates' => 'array',
        'fare_multiplier' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Check if a point is inside this zone
    public function containsPoint($lat, $lng)
    {
        $vertices = $this->coordinates;
        $n = count($vertices);
        $inside = false;

        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            $xi = $vertices[$i]['lat'];
            $yi = $vertices[$i]['lng'];
            $xj = $vertices[$j]['lat'];
            $yj = $vertices[$j]['lng'];

            if ((($yi > $lng) != ($yj > $lng)) &&
                ($lat < ($xj - $xi) * ($lng - $yi) / ($yj - $yi) + $xi)) {
                $inside = !$inside;
            }
        }

        return $inside;
    }

    // Find zones containing a point
    public static function findZonesForLocation($lat, $lng)
    {
        return self::where('is_active', true)
            ->get()
            ->filter(function ($zone) use ($lat, $lng) {
                return $zone->containsPoint($lat, $lng);
            });
    }

    // Get zone type color
    public function getTypeColorAttribute()
    {
        return match($this->type) {
            'service_area' => 'green',
            'restricted' => 'red',
            'high_demand' => 'orange',
            'airport' => 'blue',
            'special' => 'purple',
            default => 'gray'
        };
    }
}
