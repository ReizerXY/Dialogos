<?php
// app/Exports/CitasExport.php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CitasExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles, WithTitle
{
    protected Collection $citas;

    public function __construct(Collection $citas)
    {
        $this->citas = $citas;
    }

    public function collection(): Collection
    {
        return $this->citas;
    }

    public function headings(): array
    {
        return [
            'ID Cita',
            'ID Estudiante',
            'Estudiante',
            'Formador',
            'Fecha',
            'Hora',
            'Tema tratado',
            'Situación',
            'Asistencia',
            'Notas',
        ];
    }

    public function map($cita): array
    {
        return [
            $cita->id_cita,
            $cita->id_estudiante,
            $cita->nombre_estudiante,
            $cita->nombre_formador,
            $cita->fecha,
            $cita->hora ? substr($cita->hora, 0, 5) : '',
            $cita->clasificacion ?? 'Sin clasificar',
            $cita->estado ?? '',
            $cita->asistencia ?? 'pendiente',
            $cita->notas ?? '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold'  => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size'  => 11,
                ],
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'FF5900'],
                ],
                'alignment' => [
                    'horizontal' => 'center',
                    'vertical'   => 'center',
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'Citas';
    }
}