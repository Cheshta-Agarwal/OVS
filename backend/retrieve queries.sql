-- SELECT id, username, hashed_password FROM users;
-- SELECT id,username,has_voted FROM users;
-- SELECT * FROM votes;
-- SELECT id,username,has_voted FROM users WHERE username IN ('votera','voterb');
SELECT * FROM encrypted_ballots ORDER BY id DESC LIMIT 5;
-- DELETE FROM users WHERE username = 'voterf';