-- AI Use: NEED TO ADD
-- Need to add min, four stored procedures. Check Rubric/Discord list
DROP PROCEDURE IF EXISTS remove_csgo;
DELIMITER //
CREATE PROCEDURE remove_csgo()
BEGIN
    DELETE FROM Games WHERE Games.gameID = 1;
END //

DELIMITER ;
