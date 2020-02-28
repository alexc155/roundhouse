IF  EXISTS (SELECT *
FROM sys.objects
WHERE object_id = OBJECT_ID(N'[RoundhousE].[tmp_test_rh]') AND type in (N'P', N'PC'))
DROP PROCEDURE [RoundhousE].[tmp_test_rh]
GO

/* This is a dummy procedure that returns fake data */
CREATE PROCEDURE [RoundhousE].[tmp_test_rh]
AS
SELECT 1+2 AS tmp;
GO
