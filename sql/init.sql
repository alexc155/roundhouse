SET NOCOUNT ON;
IF NOT EXISTS
(SELECT *
FROM dbo.sysobjects
WHERE id = object_id(N'RoundhousE.Version') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
    CREATE TABLE RoundhousE.Version
    (
        id BIGINT IDENTITY NOT NULL,
        repository_path NVARCHAR(255) NULL,
        [version] NVARCHAR(50) NULL,
        entry_date DATETIME NULL,
        modified_date DATETIME NULL,
        entered_by NVARCHAR(50) NULL,
        PRIMARY KEY (id)
    );
END
IF NOT EXISTS
(SELECT *
FROM dbo.sysobjects
WHERE id = object_id(N'RoundhousE.ScriptsRun') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
    CREATE TABLE RoundhousE.ScriptsRun
    (
        id BIGINT IDENTITY NOT NULL,
        version_id BIGINT NULL,
        script_name NVARCHAR(255) NULL,
        text_of_script text NULL,
        text_hash NVARCHAR(512) NULL,
        one_time_script BIT NULL,
        entry_date DATETIME NULL,
        modified_date DATETIME NULL,
        entered_by NVARCHAR(50) NULL,
        PRIMARY KEY (id)
    );
END
IF NOT EXISTS
(SELECT *
FROM dbo.sysobjects
WHERE id = object_id(N'RoundhousE.ScriptsRunErrors') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
    CREATE TABLE RoundhousE.ScriptsRunErrors
    (
        id BIGINT IDENTITY NOT NULL,
        repository_path NVARCHAR(255) NULL,
        [version] NVARCHAR(50) NULL,
        script_name NVARCHAR(255) NULL,
        text_of_script NTEXT NULL,
        erroneous_part_of_script NTEXT NULL,
        [error_message] NTEXT NULL,
        entry_date DATETIME NULL,
        modified_date DATETIME NULL,
        entered_by NVARCHAR(50) NULL,
        PRIMARY KEY (id)
    );
END
SELECT 1;