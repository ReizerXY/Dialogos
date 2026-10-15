<?php
// app/Exports/EstudiantesExport.php

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

class EstudiantesExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles, WithTitle
{
    protected Collection $estudiantes;

    public function __construct(Collection $estudiantes)
    {
        $this->estudiantes = $estudiantes;
    }

    public function collection(): Collection
    {
        return $this->estudiantes;
    }

    public function headings(): array
    {
        return [
            'ID Estudiante',
            'Nombre',
            'Apellido Paterno',
            'Apellido Materno',
            'Grado',
            'Grupo',
            'Contacto',
            'Contacto de Emergencia',
        ];
    }

    public function map($estudiante): array
    {
        return [
            $this->safeCell($estudiante->id_estudiante),
            $this->safeCell($estudiante->nombre),
            $this->safeCell($estudiante->apellido_paterno),
            $this->safeCell($estudiante->apellido_materno),
            $this->safeCell($estudiante->grado),
            $this->safeCell($estudiante->grupo),
            $this->safeCell($estudiante->contacto),
            $this->safeCell($estudiante->contacto_emergencia),
        ];
    }

    // Sanitiza celdas para evitar Excel injection
    private function safeCell($value)
    {
        if ($value === null || $value === '') return '';

        $value = (string) $value;
        $primer = substr($value, 0, 1);

        if (in_array($primer, ['=', '+', '-', '@', "\t", "\r"], true)) {
            return "'" . $value;
        }

        return $value;
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
        return 'Estudiantes';
    }
}