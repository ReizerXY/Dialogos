-- ============================================================
-- Migración producción — alinear esquema con local
-- Idempotente. NO toca datos existentes. NO toca contraseñas.
-- ============================================================

-- ------------------------------------------------------------
-- 1. usuarios: activo → visibilidad_usuario + agregar acceso_usuario
-- ------------------------------------------------------------

SET @exist := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'usuarios'
      AND COLUMN_NAME = 'activo'
);
SET @sql := IF(@exist > 0,
    'ALTER TABLE `usuarios` CHANGE `activo` `visibilidad_usuario` TINYINT(1) NOT NULL DEFAULT 1',
    'SELECT "activo no existe, se omite" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'usuarios'
      AND COLUMN_NAME = 'acceso_usuario'
);
SET @sql := IF(@exist = 0,
    'ALTER TABLE `usuarios` ADD COLUMN `acceso_usuario` TINYINT(1) NOT NULL DEFAULT 1 AFTER `visibilidad_usuario`',
    'SELECT "acceso_usuario ya existe, se omite" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 2. estudiantes: telefono_* → contacto*
-- ------------------------------------------------------------

SET @exist := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'estudiantes'
      AND COLUMN_NAME = 'telefono_estudiante'
);
SET @sql := IF(@exist > 0,
    'ALTER TABLE `estudiantes` CHANGE `telefono_estudiante` `contacto` VARCHAR(15) NULL DEFAULT NULL',
    'SELECT "telefono_estudiante no existe, se omite" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'estudiantes'
      AND COLUMN_NAME = 'telefono_padre'
);
SET @sql := IF(@exist > 0,
    'ALTER TABLE `estudiantes` CHANGE `telefono_padre` `contacto_emergencia` VARCHAR(15) NULL DEFAULT NULL',
    'SELECT "telefono_padre no existe, se omite" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 3. Tabla configuracion
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `configuracion` (
  `clave` varchar(50) NOT NULL,
  `valor` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `configuracion` (`clave`, `valor`) VALUES
    ('inicio_ciclo_escolar', NULL),
    ('importacion_activa_manual', '0'),
    ('importacion_completada', '1');

-- ------------------------------------------------------------
-- 4. Verificación
-- ------------------------------------------------------------

SELECT '=== ESTRUCTURA usuarios ===' AS info;
DESCRIBE usuarios;

SELECT '=== ESTRUCTURA estudiantes ===' AS info;
DESCRIBE estudiantes;

SELECT '=== CONTENIDO configuracion ===' AS info;
SELECT * FROM configuracion;

SELECT '=== USUARIOS (no se modificaron) ===' AS info;
SELECT id_usuario, usuario, rol, visibilidad_usuario, acceso_usuario FROM usuarios;