-- ============================================================
-- Rollback: revertir los cambios de esquema de la migración.
-- NO borra datos. Solo revierte nombres de columnas.
-- ============================================================

-- ------------------------------------------------------------
-- 1. usuarios: visibilidad_usuario → activo + eliminar acceso_usuario
-- ------------------------------------------------------------

SET @exist := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'usuarios'
      AND COLUMN_NAME = 'visibilidad_usuario'
);
SET @sql := IF(@exist > 0,
    'ALTER TABLE `usuarios` CHANGE `visibilidad_usuario` `activo` TINYINT(1) NOT NULL DEFAULT 1',
    'SELECT "visibilidad_usuario no existe, se omite" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'usuarios'
      AND COLUMN_NAME = 'acceso_usuario'
);
SET @sql := IF(@exist > 0,
    'ALTER TABLE `usuarios` DROP COLUMN `acceso_usuario`',
    'SELECT "acceso_usuario no existe, se omite" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 2. estudiantes: contacto* → telefono_*
-- ------------------------------------------------------------

SET @exist := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'estudiantes'
      AND COLUMN_NAME = 'contacto'
);
SET @sql := IF(@exist > 0,
    'ALTER TABLE `estudiantes` CHANGE `contacto` `telefono_estudiante` VARCHAR(15) NULL DEFAULT NULL',
    'SELECT "contacto no existe, se omite" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'estudiantes'
      AND COLUMN_NAME = 'contacto_emergencia'
);
SET @sql := IF(@exist > 0,
    'ALTER TABLE `estudiantes` CHANGE `contacto_emergencia` `telefono_padre` VARCHAR(15) NULL DEFAULT NULL',
    'SELECT "contacto_emergencia no existe, se omite" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT '=== ROLLBACK COMPLETADO ===' AS info;
DESCRIBE usuarios;
DESCRIBE estudiantes;