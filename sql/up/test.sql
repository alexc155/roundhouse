IF  EXISTS (SELECT *
FROM sys.objects
WHERE object_id = OBJECT_ID(N'[RoundhousE].[tmp_test_rh]') AND type in (N'P', N'PC'))
--now go to good go again go final

DROP PROCEDURE [RoundhousE].[tmp_test_rh]
GO

/* This is a 
dummy go procedure 
that returns fake data */

/*go*/

/* This is a dummy procedure that returns fake data */
CREATE PROCEDURE [RoundhousE].[tmp_test_rh]
AS -- go
SELECT 1+2 AS tmp;
GO
